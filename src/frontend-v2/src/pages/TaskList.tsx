import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Table,
  Button,
  Input,
  Select,
  Tag,
  Space,
  Popconfirm,
  message,
  Card,
  Row,
  Col,
  Tooltip,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  ExportOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { taskApi } from '@/api'
import { TaskFormModal } from '@/components/TaskFormModal'
import type { ColumnsType } from 'antd/es/table'

interface Task {
  id: string
  title: string
  description: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  tags: string[]
  dueDate: string
  createdAt: string
}

export const TaskList: React.FC = () => {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('createdAt:desc')
  const [modalVisible, setModalVisible] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', search, status, sortBy],
    queryFn: () => taskApi.getAll({ search, status: status.join(','), sortBy }),
  })

  const deleteMutation = useMutation({
    mutationFn: taskApi.delete,
    onSuccess: () => {
      message.success('任务已删除')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const completeMutation = useMutation({
    mutationFn: (id: string) => taskApi.update(id, { status: 'COMPLETED' }),
    onSuccess: () => {
      message.success('任务已完成')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const columns: ColumnsType<Task> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.description}</div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          PENDING: { color: 'default', text: '待处理' },
          IN_PROGRESS: { color: 'processing', text: '进行中' },
          COMPLETED: { color: 'success', text: '已完成' },
        }
        const { color, text } = statusMap[status]
        return <Tag color={color}>{text}</Tag>
      },
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority) => {
        const priorityMap = {
          LOW: { color: 'default', text: '低' },
          MEDIUM: { color: 'warning', text: '中' },
          HIGH: { color: 'error', text: '高' },
        }
        const { color, text } = priorityMap[priority]
        return <Tag color={color}>{text}</Tag>
      },
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags) => (
        <Space size={4}>
          {tags?.map((tag: string) => (
            <Tag key={tag} style={{ margin: 0 }}>{tag}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '截止日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          {record.status !== 'COMPLETED' && (
            <Tooltip title="完成">
              <Button
                type="text"
                icon={<CheckCircleOutlined />}
                onClick={() => completeMutation.mutate(record.id)}
              />
            </Tooltip>
          )}
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingTask(record)
                setModalVisible(true)
              }}
            />
          </Tooltip>
          <Popconfirm
            title="确定删除此任务？"
            onConfirm={() => deleteMutation.mutate(record.id)}
          >
            <Tooltip title="删除">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const tasks = data?.tasks || []

  return (
    <Card>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col flex="auto">
          <Input.Search
            placeholder="搜索任务..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
        </Col>
        <Col>
          <Select
            mode="multiple"
            placeholder="筛选状态"
            value={status}
            onChange={setStatus}
            style={{ width: 200 }}
            options={[
              { label: '待处理', value: 'PENDING' },
              { label: '进行中', value: 'IN_PROGRESS' },
              { label: '已完成', value: 'COMPLETED' },
            ]}
          />
        </Col>
        <Col>
          <Select
            value={sortBy}
            onChange={setSortBy}
            style={{ width: 150 }}
            options={[
              { label: '最新创建', value: 'createdAt:desc' },
              { label: '最早创建', value: 'createdAt:asc' },
              { label: '标题 A-Z', value: 'title:asc' },
              { label: '优先级', value: 'priority:desc' },
            ]}
          />
        </Col>
        <Col>
          <Button icon={<ExportOutlined />}>导出</Button>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingTask(null)
              setModalVisible(true)
            }}
          >
            新建任务
          </Button>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={tasks}
        rowKey="id"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />

      <TaskFormModal
        visible={modalVisible}
        task={editingTask}
        onCancel={() => setModalVisible(false)}
        onSuccess={() => {
          setModalVisible(false)
          queryClient.invalidateQueries({ queryKey: ['tasks'] })
        }}
      />
    </Card>
  )
}
