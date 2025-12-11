#!/usr/bin/env node

/**
 * 安全检查脚本
 * 在提交代码前运行，确保没有敏感信息被提交
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

console.log('\n🔒 开始安全检查...\n');

let hasErrors = false;
let hasWarnings = false;

// 检查 1: 确保 .env.local 被忽略
console.log('📋 检查 1: 验证 .env.local 是否被 Git 忽略...');
try {
  const result = execSync('git check-ignore .env.local', { encoding: 'utf-8' });
  if (result.includes('.env.local')) {
    console.log(`${GREEN}✅ .env.local 已被正确忽略${RESET}\n`);
  }
} catch (error) {
  console.log(`${RED}❌ 错误: .env.local 没有被忽略！${RESET}`);
  console.log(`${YELLOW}   请检查 .gitignore 文件${RESET}\n`);
  hasErrors = true;
}

// 检查 2: 确保 node_modules 被忽略
console.log('📋 检查 2: 验证 node_modules 是否被 Git 忽略...');
try {
  const result = execSync('git check-ignore node_modules', { encoding: 'utf-8' });
  if (result.includes('node_modules')) {
    console.log(`${GREEN}✅ node_modules 已被正确忽略${RESET}\n`);
  }
} catch (error) {
  console.log(`${RED}❌ 错误: node_modules 没有被忽略！${RESET}\n`);
  hasErrors = true;
}

// 检查 3: 确保 dist 被忽略
console.log('📋 检查 3: 验证 dist 是否被 Git 忽略...');
try {
  const result = execSync('git check-ignore dist', { encoding: 'utf-8' });
  if (result.includes('dist')) {
    console.log(`${GREEN}✅ dist 已被正确忽略${RESET}\n`);
  }
} catch (error) {
  console.log(`${YELLOW}⚠️  警告: dist 没有被忽略${RESET}\n`);
  hasWarnings = true;
}

// 检查 4: 搜索可能的 API Key
console.log('📋 检查 4: 搜索代码中的潜在 API Key...');
try {
  const files = execSync('git ls-files', { encoding: 'utf-8' }).split('\n');
  const sensitivePatterns = [
    /sk-or-v1-[a-zA-Z0-9]{64}/,  // OpenRouter API Key
    /AIza[0-9A-Za-z-_]{35}/,      // Google API Key
    /sk-[a-zA-Z0-9]{48}/,         // OpenAI API Key
  ];

  let foundSensitive = false;

  for (const file of files) {
    if (!file || file.endsWith('.md') || file.includes('node_modules')) continue;
    
    try {
      const content = fs.readFileSync(file, 'utf-8');
      
      for (const pattern of sensitivePatterns) {
        if (pattern.test(content)) {
          console.log(`${RED}❌ 发现潜在的 API Key 在文件: ${file}${RESET}`);
          foundSensitive = true;
          hasErrors = true;
        }
      }
    } catch (err) {
      // 忽略无法读取的文件
    }
  }

  if (!foundSensitive) {
    console.log(`${GREEN}✅ 没有发现硬编码的 API Key${RESET}\n`);
  } else {
    console.log(`${RED}   请移除硬编码的 API Key，使用环境变量！${RESET}\n`);
  }
} catch (error) {
  console.log(`${YELLOW}⚠️  无法检查 API Key${RESET}\n`);
}

// 检查 5: 确保 .env.example 存在
console.log('📋 检查 5: 验证 .env.example 是否存在...');
if (fs.existsSync('.env.example')) {
  console.log(`${GREEN}✅ .env.example 文件存在${RESET}\n`);
} else {
  console.log(`${YELLOW}⚠️  警告: .env.example 文件不存在${RESET}`);
  console.log(`${YELLOW}   建议创建 .env.example 作为配置示例${RESET}\n`);
  hasWarnings = true;
}

// 检查 6: 验证将要提交的文件
console.log('📋 检查 6: 验证暂存区文件...');
try {
  const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf-8' });
  
  if (stagedFiles.includes('.env') || stagedFiles.includes('.env.local')) {
    console.log(`${RED}❌ 错误: 暂存区包含环境变量文件！${RESET}`);
    console.log(`${YELLOW}   运行: git reset HEAD .env.local${RESET}\n`);
    hasErrors = true;
  } else {
    console.log(`${GREEN}✅ 暂存区没有敏感文件${RESET}\n`);
  }
} catch (error) {
  console.log(`${GREEN}✅ 暂存区为空或没有敏感文件${RESET}\n`);
}

// 总结
console.log('━'.repeat(50));
if (hasErrors) {
  console.log(`\n${RED}❌ 安全检查失败！请修复上述错误后再提交。${RESET}\n`);
  process.exit(1);
} else if (hasWarnings) {
  console.log(`\n${YELLOW}⚠️  安全检查通过，但有警告。${RESET}\n`);
  process.exit(0);
} else {
  console.log(`\n${GREEN}✅ 安全检查通过！可以安全提交。${RESET}\n`);
  process.exit(0);
}

