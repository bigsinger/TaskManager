import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Tag, Button, message, Tooltip } from 'antd'
import { CheckCircleOutlined, ArrowRightOutlined } from '@ant-design/icons'
import { taskApi } from '@/api'

const columns = [
  { key: 'PENDING', title: '待处理', color: '#faad14' },
  { key: 'IN_PROGRESS', title: '进行中', color: '#1890ff' },
  { key: 'COMPLETED', title: '已完成', color: '#52c41a' },
]

export const Kanban: React.FC = () => {
  const { data } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskApi.getAll({ limit: 10000 })
  })

  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      taskApi.update(id, { status }),
    onSuccess: () => {
      message.success('状态已更新')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })

  const tasks = (data as any)?.tasks || []

  const getTasksByStatus = (status: string) =>
    tasks.filter((t: any) => t.status === status)

  const getPriorityColor = (priority: string) => {
    const map: Record<string, string> = {
      HIGH: 'red',
      MEDIUM: 'orange',
      LOW: 'green'
    }
    return map[priority] || 'default'
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>看板视图</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {columns.map(col => (
          <Card
            key={col.key}
            title={
              <div style={{ color: col.color, fontWeight: 600 }}>
                {col.title} ({getTasksByStatus(col.key).length})
              </div>
            }
            style={{ background: '#f5f5f5', minHeight: 500 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {getTasksByStatus(col.key).map((task: any) => (
                <Card
                  key={task.id}
                  size="small"
                  style={{ cursor: 'pointer' }}
                  bodyStyle={{ padding: 12 }}
                >
                  <div style={{ fontWeight: 500, marginBottom: 8 }}>{task.title}</div>
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>
                    {task.description?.substring(0, 50)}...
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Tag color={getPriorityColor(task.priority)} size="small">
                      {task.priority}
                    </Tag>
                    <div>
                      {col.key !== 'COMPLETED' && (
                        <Tooltip title="标记完成">
                          <Button
                            type="text"
                            size="small"
                            icon={<CheckCircleOutlined />}
                            onClick={() => updateMutation.mutate({ id: task.id, status: 'COMPLETED' })}
                          />
                        </Tooltip>
                      )}
                      {col.key === 'PENDING' && (
                        <Tooltip title="开始">
                          <Button
                            type="text"
                            size="small"
                            icon={<ArrowRightOutlined />}
                            onClick={() => updateMutation.mutate({ id: task.id, status: 'IN_PROGRESS' })}
                          />
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
