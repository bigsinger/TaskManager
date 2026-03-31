import React, { useEffect } from 'react'
import { Modal, Form, Input, Select, DatePicker, Button, Space } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { taskApi } from '@/api'
import dayjs from 'dayjs'

interface Props {
  visible: boolean
  task: any
  onCancel: () => void
  onSuccess: () => void
}

const { TextArea } = Input

export const TaskFormModal: React.FC<Props> = ({ visible, task, onCancel, onSuccess }) => {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (visible && task) {
      form.setFieldsValue({
        ...task,
        dueDate: task.dueDate ? dayjs(task.dueDate) : null,
        tags: typeof task.tags === 'string' ? JSON.parse(task.tags) : task.tags
      })
    } else if (visible) {
      form.resetFields()
    }
  }, [visible, task, form])

  const mutation = useMutation({
    mutationFn: (values: any) => {
      const data = {
        ...values,
        dueDate: values.dueDate?.format('YYYY-MM-DD'),
        tags: JSON.stringify(values.tags || [])
      }
      if (task) {
        return taskApi.update(task.id, data)
      }
      return taskApi.create(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      onSuccess()
    }
  })

  const handleSubmit = () => {
    form.validateFields().then(values => {
      mutation.mutate(values)
    })
  }

  return (
    <Modal
      title={task ? '编辑任务' : '新建任务'}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          label="标题"
          name="title"
          rules={[{ required: true, message: '请输入标题' }]}
        >
          <Input placeholder="请输入任务标题" />
        </Form.Item>

        <Form.Item label="描述" name="description">
          <TextArea rows={4} placeholder="请输入任务描述" />
        </Form.Item>

        <Form.Item
          label="状态"
          name="status"
          rules={[{ required: true }]}
          initialValue="PENDING"
        >
          <Select
            options={[
              { label: '待处理', value: 'PENDING' },
              { label: '进行中', value: 'IN_PROGRESS' },
              { label: '已完成', value: 'COMPLETED' },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="优先级"
          name="priority"
          rules={[{ required: true }]}
          initialValue="MEDIUM"
        >
          <Select
            options={[
              { label: '低', value: 'LOW' },
              { label: '中', value: 'MEDIUM' },
              { label: '高', value: 'HIGH' },
            ]}
          />
        </Form.Item>

        <Form.Item label="截止日期" name="dueDate">
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="标签" name="tags">
          <Select
            mode="tags"
            placeholder="输入标签"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onCancel}>取消</Button>
            <Button type="primary" onClick={handleSubmit} loading={mutation.isPending}>
              保存
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}
