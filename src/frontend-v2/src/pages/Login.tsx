import React from 'react'
import { Form, Input, Button, Card, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@/api'
import { useAuthStore } from '@/stores'

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [form] = Form.useForm()

  const onFinish = async (values: any) => {
    try {
      const response = await authApi.login(values) as any
      login(response.user, response.token)
      message.success('登录成功')
      navigate('/')
    } catch (error) {
      message.error('登录失败，请检查邮箱和密码')
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{ width: 400, borderRadius: 8 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>TaskManager 登录</h2>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱' }
            ]}
          >
            <Input placeholder="请输入邮箱" size="large" />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入密码" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              登录
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            还没有账号？<a onClick={() => navigate('/register')}>立即注册</a>
          </div>
        </Form>
      </Card>
    </div>
  )
}
