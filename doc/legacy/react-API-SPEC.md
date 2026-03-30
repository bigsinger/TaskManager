# React 前端 API 规范文档

## 1. 基础信息
- 文档版本：V1.0
- 开发人员：白晶晶
- 评审人员：老板
- 技术栈：React + TypeScript + Vite
- 上线时间：2026-03-28

## 2. 需求定义

### 2.1 功能描述
提供一个完整的任务管理系统前端界面，支持任务的创建、读取、更新、删除（CRUD）操作，以及分页、筛选、排序等功能。

### 2.2 业务规则
- 规则1：任务标题必填，长度限制为 1-200 字符
- 规则2：任务描述可选，最大长度为 1000 字符
- 规则3：任务状态包括：pending（待办）、in-progress（进行中）、completed（已完成）
- 规则4：任务标签可选，多个标签用逗号分隔
- 规则5：支持按状态和标签筛选任务
- 规则6：支持分页查询，默认每页 20 条记录
- 规则7：支持按创建时间排序

### 2.3 验收标准（可测试）
- 响应时间 < 200ms（单次查询）
- 异常场景全覆盖（参数校验、资源不存在、网络错误）
- 数据一致性保障（乐观更新）
- 用户体验良好（加载状态、错误提示）

## 3. 组件设计

### 3.1 TaskList 组件
- 显示所有任务列表
- 支持分页
- 支持筛选和排序
- 支持加载和错误状态

### 3.2 TaskItem 组件
- 显示单个任务
- 显示任务状态
- 显示任务标签
- 提供编辑和删除按钮

### 3.3 TaskForm 组件
- 创建/编辑任务表单
- 表单验证
- 提交到 API

### 3.4 TaskStatus 组件
- 显示任务状态
- 支持状态切换
- 颜色编码

### 3.5 App 组件
- 状态管理
- CRUD 操作
- API 集成
- 路由管理

## 4. API 集成

### 4.1 API 端点
- `GET /api/tasks` - 获取任务列表
- `POST /api/tasks` - 创建任务
- `PUT /api/tasks/:id` - 更新任务
- `DELETE /api/tasks/:id` - 删除任务

### 4.2 请求格式
- **创建任务：**
```json
{
  "title": "任务标题",
  "description": "任务描述",
  "status": "pending",
  "tags": "work,important"
}
```

- **更新任务：**
```json
{
  "title": "更新后的标题",
  "description": "更新后的描述",
  "status": "in-progress",
  "tags": "work,urgent"
}
```

### 4.3 响应格式
- **成功响应（200）：**
```json
{
  "id": 1,
  "title": "任务标题",
  "description": "任务描述",
  "status": "pending",
  "tags": "work,important",
  "createdAt": "2026-03-28T10:00:00.000Z",
  "updatedAt": "2026-03-28T10:00:00.000Z"
}
```

- **错误响应（400）：**
```json
{
  "error": "Title is required"
}
```

### 4.4 错误处理
- 网络错误处理
- 参数校验错误
- 404 错误处理
- 500 错误处理

## 5. 状态管理

### 5.1 状态定义
- **tasks** - 任务列表
- **loading** - 加载状态
- **error** - 错误信息
- **editingTask** - 正在编辑的任务
- **formOpen** - 表单是否打开
- **currentPage** - 当前页码
- **limit** - 每页数量
- **total** - 总数
- **totalPages** - 总页数
- **selectedStatuses** - 选中的状态
- **filterTags** - 筛选的标签

### 5.2 状态更新
- **setTasks** - 更新任务列表
- **setLoading** - 更新加载状态
- **setError** - 更新错误信息
- **setEditingTask** - 设置正在编辑的任务
- **setFormOpen** - 设置表单是否打开
- **setCurrentPage** - 设置当前页码
- **setLimit** - 设置每页数量
- **setTotal** - 设置总数
- **setTotalPages** - 设置总页数
- **setSelectedStatuses** - 设置选中的状态
- **setFilterTags** - 设置筛选的标签

## 6. 组件通信

### 6.1 父子组件通信
- **App → TaskList** - 传递任务列表、编辑函数、删除函数、语言
- **App → TaskForm** - 传递任务、保存函数、取消函数、语言
- **App → TaskItem** - 传递任务、编辑函数、删除函数、语言
- **App → Pagination** - 传递当前页码、总页数、页码切换函数、语言
- **App → Settings** - 传递语言、设置语言函数、主题、设置主题函数

### 6.2 事件处理
- **onEditTask** - 编辑任务
- **onDeleteTask** - 删除任务
- **onPageChange** - 切换页码
- **onLimitChange** - 改变每页数量
- **onStatusToggle** - 切换状态筛选
- **onTagToggle** - 切换标签筛选
- **onOpenForm** - 打开表单
- **onCloseForm** - 关闭表单
- **onSaveTask** - 保存任务
- **onCancelEdit** - 取消编辑

## 7. 路由设计

### 7.1 路由结构
```
/ - 首页
/tasks - 任务列表
/settings - 设置
```

### 7.2 路由参数
- **/:id** - 任务 ID

## 8. 样式设计

### 8.1 颜色方案
- **主色调：** 蓝色
- **辅助色：** 绿色、橙色、灰色
- **状态颜色：**
  - pending: 灰色
  - in-progress: 橙色
  - completed: 绿色

### 8.2 响应式设计
- 移动优先
- 平板适配
- 桌面适配

### 8.3 组件样式
- 模块化 CSS
- 组件级样式
- 全局样式

## 9. 性能优化

### 9.1 组件优化
- 使用 React.memo 避免不必要的重渲染
- 使用 useMemo 缓存计算结果
- 使用 useCallback 缓存回调函数

### 9.2 代码分割
- 路由级别代码分割
- 组件级别懒加载
- 动态导入

### 9.3 虚拟化长列表
- 使用 react-window 或 react-virtualized
- 只渲染可见的项目

### 9.4 图片优化
- 使用现代图片格式
- 响应式图片
- 懒加载

## 10. 测试策略

### 10.1 单元测试
- 组件渲染测试
- 状态管理测试
- 事件处理测试

### 10.2 集成测试
- API 集成测试
- CRUD 操作测试
- 错误处理测试

### 10.3 E2E 测试
- 完整的用户流程测试
- 跨组件交互测试

## 11. 国际化

### 11.1 语言支持
- 中文
- 英文

### 11.2 翻译文件
- zh-CN.json
- en-US.json

### 11.3 翻译键
- 使用 i18next 或 react-i18next
- 支持动态语言切换

## 12. 部署

### 12.1 构建命令
```bash
npm run build
```

### 12.2 部署命令
```bash
npm run preview
```

### 12.3 环境变量
- VITE_API_URL - API 基础 URL
- VITE_MODE - 运行模式

## 13. 文档

### 13.1 README.md
- 项目说明
- 安装依赖
- 运行项目
- 开发指南

### 13.2 API-SPEC.md
- API 规范文档

### 13.3 组件文档
- 组件说明
- 组件 API
- 组件示例

## 14. 版本历史

### V1.0 (2026-03-28)
- 初始版本
- 实现基本的 CRUD 操作
- 支持分页、筛选、排序
- 支持国际化

---

最后更新: 2026-03-28 00:10
