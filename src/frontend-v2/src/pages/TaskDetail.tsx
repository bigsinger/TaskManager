import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Card,
  Descriptions,
  Tag,
  Button,
  List,
  Select,
  message,
  Divider,
  Popconfirm
} from 'antd'
import {
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  StopOutlined
} from '@ant-design/icons'
import { taskApi } from '@/api'
import dayjs from 'dayjs'

const { Option } = Select

export const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedDependency, setSelectedDependency] = useState<string>('')

  const { data: taskData } = useQuery({
    queryKey: ['task', id],
    queryFn: () => taskApi.getById(id!)
  })

  const { data: allTasksData } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskApi.getAll({ limit: 10000 })
  })

  const { data: dependenciesData } = useQuery({
    queryKey: ['dependencies', id],
    queryFn: () => fetch(`/api/tasks/${id}/dependencies`).then(r => r.json())
  })

  const addDependencyMutation = useMutation({
    mutationFn: (dependsOnId: string) =>
      fetch('/api/dependencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: id, dependsOnId, type: 'BLOCKS' })
      }),
    onSuccess: () => {
      message.success('依赖添加成功')
      queryClient.invalidateQueries({ queryKey: ['dependencies', id] })
      setSelectedDependency('')
    },
    onError: () => {
      message.error('添加失败，可能存在循环依赖')
    }
  })

  const removeDependencyMutation = useMutation({
    mutationFn: (dependencyId: string) =>
      fetch(`/api/dependencies/${dependencyId}`, { method: 'DELETE' }),
    onSuccess: () => {
      message.success('依赖已移除')
      queryClient.invalidateQueries({ queryKey: ['dependencies', id] })
    }
  })

  const completeMutation = useMutation({
    mutationFn: () => taskApi.update(id!, { status: 'COMPLETED' }),
    onSuccess: () => {
      message.success('任务已完成')
      queryClient.invalidateQueries({ queryKey: ['task', id] })
    }
  })

  const task = (taskData as any) || {}
  const allTasks = (allTasksData as any)?.tasks || []
  const dependencies = dependenciesData?.dependencies || []
  const dependents = dependenciesData?.dependents || []

  const availableTasks = allTasks.filter(
    (t: any) => t.id !== id && !dependencies.some((d: any) => d.task.id === t.id)
  )

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      PENDING: 'default',
      IN_PROGRESS: 'processing',
      COMPLETED: 'success'
    }
    return map[status] || 'default'
  }

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      PENDING: '待处理',
      IN_PROGRESS: '进行中',
      COMPLETED: '已完成'
    }
    return map[status] || status
  }

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} style={{ marginBottom: 16 }}>
        返回列表
      </Button>

      <Card
        title={task.title}
        extra={
          task.status !== 'COMPLETED' && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => completeMutation.mutate()}
              loading={completeMutation.isPending}
            >
              标记完成
            </Button>
          )
        }
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="状态">
            <Tag color={getStatusColor(task.status)}>{getStatusText(task.status)}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="优先级">
            <Tag color={task.priority === 'HIGH' ? 'red' : task.priority === 'MEDIUM' ? 'orange' : 'green'}>
              {task.priority === 'HIGH' ? '高' : task.priority === 'MEDIUM' ? '中' : '低'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="截止日期">
            {task.dueDate ? dayjs(task.dueDate).format('YYYY-MM-DD') : '无'}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {task.createdAt ? dayjs(task.createdAt).format('YYYY-MM-DD HH:mm') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="描述" span={2}>
            {task.description || '无描述'}
          </Descriptions.Item>
          <Descriptions.Item label="标签" span={2}>
            {(() => {
              const tags = typeof task.tags === 'string' ? JSON.parse(task.tags) : task.tags || []
              return tags.length > 0 ? tags.map((tag: string) => <Tag key={tag}>{tag}</Tag>) : '无标签'
            })()}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <h3>任务依赖</h3>
        <p style={{ color: '#666', fontSize: 14 }}>
          此任务依赖于以下任务（必须先完成这些任务才能开始此任务）
        </p>

        <List
          dataSource={dependencies}
          renderItem={(dep: any) => (
            <List.Item
              actions={[
                <Popconfirm
                  title="确定移除这个依赖？"
                  onConfirm={() => removeDependencyMutation.mutate(dep.id)}
                >
                  <Button type="text" danger icon={<DeleteOutlined />}>
                    移除
                  </Button>
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                avatar={
                  dep.task.status === 'COMPLETED' ? (
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                  ) : (
                    <StopOutlined style={{ color: '#faad14', fontSize: 20 }} />
                  )
                }
                title={dep.task.title}
                description={
                  <Tag color={getStatusColor(dep.task.status)}>
                    {getStatusText(dep.task.status)}
                  </Tag>
                }
              />
            </List.Item>
          )}
          locale={{ emptyText: '没有依赖任务' }}
        />

        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <Select
            style={{ width: 300 }}
            placeholder="选择要添加的依赖任务"
            value={selectedDependency || undefined}
            onChange={setSelectedDependency}
          >
            {availableTasks.map((t: any) => (
              <Option key={t.id} value={t.id}>{t.title}</Option>
            ))}
          </Select>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            disabled={!selectedDependency}
            onClick={() => addDependencyMutation.mutate(selectedDependency)}
            loading={addDependencyMutation.isPending}
          >
            添加依赖
          </Button>
        </div>

        {dependents.length > 0 && (
          <>
            <Divider />
            <h3>被以下任务依赖</h3>
            <List
              dataSource={dependents}
              renderItem={(dep: any) => (
                <List.Item>
                  <List.Item.Meta
                    title={dep.task.title}
                    description={
                      <Tag color={getStatusColor(dep.task.status)}>
                        {getStatusText(dep.task.status)}
                      </Tag>
                    }
                  />
                </List.Item>
              )}
            />
          </>
        )}
      </Card>
    </div>
  )
}
