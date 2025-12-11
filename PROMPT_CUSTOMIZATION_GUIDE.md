# 提示词自定义指南

本项目支持通过配置文件自定义提示词，可以轻松适配不同的产品类型。

## 🎯 快速切换产品类型

### 方法一：使用环境变量（推荐）

编辑 `.env.local` 文件：

```env
# 可选值: jewelry, generic, fashion
PROMPT_CONFIG_TYPE=jewelry
```

**可选值**：
- `jewelry` - 珠宝设计（默认）
- `generic` - 通用产品设计
- `fashion` - 服装设计

### 方法二：修改配置文件

直接编辑 `config/prompts.config.ts` 文件，修改 `getCurrentPromptConfig()` 函数的默认返回值。

---

## 📝 内置配置

### 1. 珠宝设计配置 (`jewelry`)

**适用于**：珠宝、首饰、配饰等

**特点**：
- 强调材质、工艺、光泽度
- 要求超高抛光、镜面效果
- 适合电商主图标准

### 2. 通用产品配置 (`generic`)

**适用于**：电子产品、家居用品、工具等

**特点**：
- 通用的产品设计分析
- 标准的电商图片要求
- 适合大多数产品类型

### 3. 服装设计配置 (`fashion`)

**适用于**：服装、鞋包、时尚配饰等

**特点**：
- 强调面料、剪裁、风格
- 适合时尚电商标准
- 支持模特展示或平铺拍摄

---

## 🛠️ 自定义新的产品类型

### 步骤 1：创建新配置

编辑 `config/prompts.config.ts`，添加新的配置对象：

```typescript
export const yourProductPromptConfig: PromptConfig = {
  productType: "你的产品类型",
  
  analysisPrompt: {
    systemRole: "Analyze this [product type] image. Provide a structured analysis.",
    fields: {
      designConcept: "设计理念描述 (用中文回答)",
      style: "风格描述 (用中文回答)",
      audience: "目标用户 (用中文回答)",
      emotionalPoint: "情感卖点 (用中文回答)",
      scenario: "使用场景 (用中文回答)",
      corePoint: "核心特点 (用中文回答)",
    },
  },
  
  generationPrompt: {
    systemRole: "Act as a world-class [product type] designer.",
    outputRequirements: `CRITICAL OUTPUT REQUIREMENTS:
- Background: PURE WHITE background (Hex #FFFFFF).
- Composition: The product must occupy exactly 85% of the image frame.
- Lighting: Professional studio photography lighting.
- DETAILS: High-quality rendering with accurate materials.`,
    productSpecificGuidelines: "Create a photorealistic, high-quality [product type] rendering.",
  },
};
```

### 步骤 2：注册新配置

在 `getCurrentPromptConfig()` 函数中添加新的 case：

```typescript
export const getCurrentPromptConfig = (): PromptConfig => {
  const configType = process.env.PROMPT_CONFIG_TYPE || 'jewelry';
  
  switch (configType) {
    case 'generic':
      return genericPromptConfig;
    case 'fashion':
      return fashionPromptConfig;
    case 'yourproduct':  // 添加这里
      return yourProductPromptConfig;
    case 'jewelry':
    default:
      return jewelryPromptConfig;
  }
};
```

### 步骤 3：使用新配置

在 `.env.local` 中设置：

```env
PROMPT_CONFIG_TYPE=yourproduct
```

---

## 🎨 提示词字段说明

### 分析提示词 (`analysisPrompt`)

- **`systemRole`**: 系统角色描述，告诉 AI 它的身份
- **`fields`**: 分析结果的各个字段及其说明
  - `designConcept`: 设计理念
  - `style`: 风格类型
  - `audience`: 目标用户
  - `emotionalPoint`: 情感卖点
  - `scenario`: 使用场景
  - `corePoint`: 核心特点

### 生成提示词 (`generationPrompt`)

- **`systemRole`**: 设计师角色描述
- **`outputRequirements`**: 输出图片的技术要求（背景、构图、光照等）
- **`productSpecificGuidelines`**: 产品特定的设计指导

---

## 💡 最佳实践

### 1. 保持一致性

确保分析和生成提示词使用相同的术语和概念。

### 2. 明确要求

在 `outputRequirements` 中明确指定：
- 背景颜色
- 产品占比
- 光照要求
- 材质表现

### 3. 测试迭代

创建新配置后：
1. 上传测试图片进行分析
2. 生成新图片查看效果
3. 根据结果调整提示词

### 4. 保留备份

修改配置前，先复制一份原始配置作为备份。

---

## 🧪 测试配置

1. **修改配置**：编辑 `.env.local` 或 `prompts.config.ts`
2. **重启服务**：`npm run dev`
3. **测试分析**：上传图片查看分析结果
4. **测试生成**：生成新图片查看效果
5. **调整优化**：根据结果微调提示词

---

## 📚 示例场景

### 场景 1：电子产品

```env
PROMPT_CONFIG_TYPE=generic
```

适合：手机、耳机、智能手表等

### 场景 2：家具设计

创建新的 `furniturePromptConfig`，强调：
- 材质（木材、金属、布料）
- 尺寸和比例
- 使用场景（客厅、卧室等）

### 场景 3：食品包装

创建新的 `packagingPromptConfig`，强调：
- 包装设计
- 品牌元素
- 视觉吸引力

---

## ⚠️ 注意事项

1. **中文字符**：提示词中可以包含中文，但要确保在字符串内部，不要放在 HTTP 头部
2. **重启服务**：修改配置后需要重启开发服务器
3. **环境变量优先级**：`.env.local` 中的设置会覆盖代码中的默认值

---

需要帮助？查看 `config/prompts.config.ts` 中的示例配置！

