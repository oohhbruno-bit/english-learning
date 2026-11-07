'use client'

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { useRegister } from '../../hooks/useAuth'
import { useUIStore } from '../../stores/uiStore'
import { validateEmail, validatePassword, cn } from '../../lib/utils'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export function RegisterPage() {
  const navigate = useNavigate()
  const { addToast } = useUIStore()
  const registerMutation = useRegister()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [passwordStrength, setPasswordStrength] = useState(0)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    if (name === 'password') {
      const validation = validatePassword(value)
      setPasswordStrength(validation.valid ? 100 : (value.length / 8) * 50)
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    validateField(name, value)
  }

  const validateField = (name: string, value: string): boolean => {
    switch (name) {
      case 'name':
        if (!value.trim()) {
          setErrors(prev => ({ ...prev, name: 'Nome é obrigatório' }))
          return false
        }
        if (value.trim().length < 2) {
          setErrors(prev => ({ ...prev, name: 'Nome deve ter pelo menos 2 caracteres' }))
          return false
        }
        break
      case 'email':
        if (!validateEmail(value)) {
          setErrors(prev => ({ ...prev, email: 'E-mail inválido' }))
          return false
        }
        break
      case 'password':
        const validation = validatePassword(value)
        if (!validation.valid) {
          setErrors(prev => ({ ...prev, password: validation.errors.join(', ') }))
          return false
        }
        break
      case 'confirmPassword':
        if (value !== formData.password) {
          setErrors(prev => ({ ...prev, confirmPassword: 'As senhas não coincidem' }))
          return false
        }
        break
    }
    return true
  }

  const validateForm = (): boolean => {
    let isValid = true
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
      isValid = false
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres'
      isValid = false
    }

    if (!formData.email) {
      newErrors.email = 'E-mail é obrigatório'
      isValid = false
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'E-mail inválido'
      isValid = false
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória'
      isValid = false
    } else {
      const validation = validatePassword(formData.password)
      if (!validation.valid) {
        newErrors.password = validation.errors.join(', ')
        isValid = false
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirme sua senha'
      isValid = false
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'As senhas não coincidem'
      isValid = false
    }

    setErrors(newErrors)
    setTouched({ name: true, email: true, password: true, confirmPassword: true })
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      await registerMutation.mutateAsync({
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
      })
      addToast({
        type: 'success',
        title: 'Conta criada!',
        message: 'Bem-vindo ao English Zero. Vamos começar?',
      })
      navigate('/onboarding', { replace: true })
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar conta. Tente novamente.'
      addToast({
        type: 'error',
        title: 'Erro no cadastro',
        message,
      })
    }
  }

  const getStrengthColor = () => {
    if (passwordStrength < 30) return 'bg-danger-500'
    if (passwordStrength < 60) return 'bg-warning-500'
    if (passwordStrength < 90) return 'bg-blue-500'
    return 'bg-success-500'
  }

  const getStrengthLabel = () => {
    if (passwordStrength < 30) return 'Fraca'
    if (passwordStrength < 60) return 'Média'
    if (passwordStrength < 90) return 'Boa'
    return 'Forte'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6" aria-label="English Zero - Início">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <span className="text-white font-bold text-2xl">E</span>
            </div>
            <span className="font-bold text-2xl text-gray-900">English Zero</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Crie sua conta</h1>
          <p className="text-gray-600 mt-2">Comece a aprender inglês hoje mesmo - 100% grátis</p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 animate-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="label">Nome completo</label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="João Silva"
                error={touched.name ? errors.name : undefined}
                autoComplete="name"
                disabled={registerMutation.isPending}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="label">E-mail</label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="seu@email.com"
                error={touched.email ? errors.email : undefined}
                autoComplete="email"
                disabled={registerMutation.isPending}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label">Senha</label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  error={touched.password ? errors.password : undefined}
                  autoComplete="new-password"
                  disabled={registerMutation.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength */}
              {formData.password && (
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-300',
                        getStrengthColor()
                      )}
                      style={{ width: `${Math.min(100, passwordStrength)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Força da senha: <span className="font-medium">{getStrengthLabel()}</span></p>
                </div>
              )}

              {/* Password Requirements */}
              <div className="mt-2 space-y-1">
                {[
                  { test: formData.password.length >= 8, label: 'Pelo menos 8 caracteres' },
                  { test: /[A-Z]/.test(formData.password), label: 'Uma letra maiúscula' },
                  { test: /[a-z]/.test(formData.password), label: 'Uma letra minúscula' },
                  { test: /[0-9]/.test(formData.password), label: 'Um número' },
                ].map((req, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <CheckCircle2
                      className={cn(
                        'w-4 h-4 flex-shrink-0',
                        req.test ? 'text-success-500' : 'text-gray-300'
                      )}
                    />
                    <span className={cn(req.test ? 'text-gray-500' : 'text-gray-400')}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="label">Confirmar senha</label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  error={touched.confirmPassword ? errors.confirmPassword : undefined}
                  autoComplete="new-password"
                  disabled={registerMutation.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                required
                className="mt-1 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                Aceito os <Link to="/terms" className="text-primary-600 hover:underline">Termos de Uso</Link> e a <Link to="/privacy" className="text-primary-600 hover:underline">Política de Privacidade</Link>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full py-3 text-lg"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Criando conta...
                </span>
              ) : (
                'Criar conta grátis'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Ou cadastre-se com</span>
            </div>
          </div>

          {/* Social Register Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="secondary"
              className="flex items-center justify-center gap-2"
              disabled={registerMutation.isPending}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex items-center justify-center gap-2"
              disabled={registerMutation.isPending}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </Button>
          </div>

          {/* Login link */}
          <p className="text-center text-gray-600 mt-6">
            Já tem conta?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}