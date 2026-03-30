# 任务管理系统 API 规范文档

## 1. 基础信息
- 文档版本：V1.0
- 开发人员：白晶晶
- 评审人员：老板
- 技术栈：Node.js + Express + PostgreSQL
- 上线时间：2026-03-27

## 2. 需求定义

### 2.1 功能描述
提供一个完整的任务管理系统，支持任务的创建、读取、更新、删除（CRUD）操作，以及分页、筛选、排序等功能。

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
- 异常场景全覆盖（参数校验、资源不存在、数据库错误）
- 数据一致性保障（事务处理）
- API 文档完整（Swagger/OpenAPI）

## 3. 接口设计

### 3.1 获取任务列表

#### 请求信息
- 请求方式：GET
- 请求路径：/api/tasks
- 请求参数：
  - page: number - 页码，默认 1
  - limit: number - 每页数量，默认 20，最大 100
  - status: string - 状态筛选（pending/in-progress/completed）
  - tags: string - 标签筛选，多个标签用逗号分隔
  - sort: string - 排序字段，默认 createdAt
  - order: string - 排序方向（asc/desc），默认 desc

#### 响应信息
- 成功响应（200）：
```json
{
  "tasks": [
    {
      "id": 1,
      "title": "任务标题",
      "description": "任务描述",
      "status": "pending",
      "tags": "work,important",
      "createdAt": "2026-03-27T10:00:00.000Z",
      "updatedAt": "2026-03-27T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

- 失败响应（400）：
```json
{
  "error": "Invalid parameter"
}
```

- 状态码说明：
  - 200：成功
  - 400：参数错误
  - 500：服务器错误

### 3.2 获取单个任务

#### 请求信息
- 请求方式：GET
- 请求路径：/api/tasks/:id
- 请求参数：
  - id: number - 任务 ID（路径参数）

#### 响应信息
- 成功响应（200）：
```json
{
  "id": 1,
  "title": "任务标题",
  "description": "任务描述",
  "status": "pending",
  "tags": "work,important",
  "createdAt": "2026-03-27T10:00:00.000Z",
  "updatedAt": "2026-03-27T10:00:00.000Z"
}
```

- 失败响应（404）：
```json
{
  "error": "Task not found"
}
```

- 状态码说明：
  - 200：成功
  - 404：任务不存在
  - 500：服务器错误

### 3.3 创建任务

#### 请求信息
- 请求方式：POST
- 请求路径：/api/tasks
- 请求参数：
```json
{
  "title": "任务标题",
  "description": "任务描述",
  "status": "pending",
  "tags": "work,important"
}
```

#### 响应信息
- 成功响应（201）：
```json
{
  "id": 1,
  "title": "任务标题",
  "description": "任务描述",
  "status": "pending",
  "tags": "work,important",
  "createdAt": "2026-03-27T10:00:00.000Z",
  "updatedAt": "2026-03-27T10:00:00.000Z"
}
```

- 失败响应（400）：
```json
{
  "error": "Title is required"
}
```

- 状态码说明：
  - 201：创建成功
  - 400：参数错误
  - 500：服务器错误

### 3.4 更新任务

#### 请求信息
- 请求方式：PUT
- 请求路径：/api/tasks/:id
- 请求参数：
  - id: number - 任务 ID（路径参数）
```json
{
  "title": "更新后的标题",
  "description": "更新后的描述",
  "status": "in-progress",
  "tags": "work,urgent"
}
```

#### 响应信息
- 成功响应（200）：
```json
{
  "id": 1,
  "title": "更新后的标题",
  "description": "更新后的描述",
  "status": "in-progress",
  "tags": "work,urgent",
  "createdAt": "2026-03-27T10:00:00.000Z",
  "updatedAt": "2026-03-27T11:00:00.000Z"
}
```

- 失败响应（404）：
```json
{
  "error": "Task not found"
}
```

- 状态码说明：
  - 200：更新成功
  - 400：参数错误
  - 404：任务不存在
  - 500：服务器错误

### 3.5 删除任务

#### 请求信息
- 请求方式：DELETE
- 请求路径：/api/tasks/:id
- 请求参数：
  - id: number - 任务 ID（路径参数）

#### 响应信息
- 成功响应（200）：
```json
{
  "message": "Task deleted successfully"
}
```

- 失败响应（404）：
```json
{
  "error": "Task not found"
}
```

- 状态码说明：
  - 200：删除成功
  - 404：任务不存在
  - 500：服务器错误

## 4. 数据模型

### 4.1 表结构/字段定义
- id: INTEGER - 主键，自增
- title: VARCHAR(200) - 任务标题，必填
- description: TEXT - 任务描述，可选
- status: VARCHAR(20) - 任务状态，默认 pending
- tags: TEXT - 任务标签，可选
- created_at: TIMESTAMP - 创建时间，自动生成
- updated_at: TIMESTAMP - 更新时间，自动更新

### 4.2 索引设计
- PRIMARY KEY: id
- INDEX: status
- INDEX: created_at
- INDEX: (status, created_at) - 复合索引

## 5. 技术约束

### 5.1 安全要求
- 使用参数化查询防止 SQL 注入
- 输入参数校验和清理
- CORS 配置允许跨域访问

### 5.2 性能要求
- 单次查询响应时间 < 200ms
- 支持并发请求
- 数据库连接池管理

### 5.3 异常处理
- 参数校验失败返回 400
- 资源不存在返回 404
- 服务器错误返回 500
- 所有错误都有明确的错误信息

## 6. 测试用例

### 6.1 获取任务列表测试
- 测试1：获取第一页任务，默认每页 20 条
- 测试2：获取第二页任务
- 测试3：按状态筛选任务
- 测试4：按标签筛选任务
- 测试5：按创建时间降序排序
- 测试6：无效的页码参数

### 6.2 创建任务测试
- 测试1：创建有效任务
- 测试2：创建任务时缺少标题
- 测试3：创建任务时标题超过 200 字符
- 测试4：创建任务时描述超过 1000 字符
- 测试5：创建任务时状态无效

### 6.3 更新任务测试
- 测试1：更新有效任务
- 测试2：更新不存在的任务
- 测试3：更新任务时标题超过 200 字符
- 测试4：更新任务时状态无效

### 6.4 删除任务测试
- 测试1：删除有效任务
- 测试2：删除不存在的任务
- 测试3：删除已删除的任务

## 7. 版本历史

### V1.0 (2026-03-27)
- 初始版本
- 实现基本的 CRUD 操作
- 支持分页、筛选、排序

---

最后更新: 2026-03-27
