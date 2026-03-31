import React, { useState } from 'react'
import { Card, Statistic, Row, Col, Progress, Tag } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { taskApi } from '@/api'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  BarChartOutlined
} from '@ant-design/icons'

export const Statistics: React.FC = () => {
  const { data } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskApi.getAll({ limit: 10000 })
  })

  const tasks = (data as any)?.tasks || []

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t: any) => t.status === 'COMPLETED').length,
    pending: tasks.filter((t: any) => t.status === 'PENDING').length,
    inProgress: tasks.filter((t: any) => t.status === 'IN_PROGRESS').length,
  }

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  // 优先级统计
  const priorityStats = {
    HIGH: tasks.filter((t: any) => t.priority === 'HIGH').length,
    MEDIUM: tasks.filter((t: any) => t.priority === 'MEDIUM').length,
    LOW: tasks.filter((t: any) => t.priority === 'LOW').length,
  }

  // 标签统计
  const tagCount: Record<string, number> = {}
  tasks.forEach((task: any) => {
    const tags = typeof task.tags === 'string' ? JSON.parse(task.tags) : task.tags || []
    tags.forEach((tag: string) => {
      tagCount[tag] = (tagCount[tag] || 0) + 1
    })
  })

  const topTags = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>
        <BarChartOutlined /> 任务统计
      </h2>

      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总任务"
              value={stats.total}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成"
              value={stats.completed}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="进行中"
              value={stats.inProgress}
              valueStyle={{ color: '#1890ff' }}
              prefix={<SyncOutlined spin />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待处理"
              value={stats.pending}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 16 }}>
        <h3>完成率</h3>
        <Progress percent={completionRate} status="active" />
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="优先级分布">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Tag color="red">高优先级: {priorityStats.HIGH}</Tag>
              <Tag color="orange">中优先级: {priorityStats.MEDIUM}</Tag>
              <Tag color="green">低优先级: {priorityStats.LOW}</Tag>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="热门标签 TOP10">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {topTags.map(([tag, count]) => (
                <Tag key={tag} color="blue">{tag}: {count}</Tag>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
