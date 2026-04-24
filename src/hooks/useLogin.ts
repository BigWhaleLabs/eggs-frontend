import usePrivyLogin from 'hooks/usePrivyLogin'

export default function useLogin() {
  const { login } = usePrivyLogin(() => {
    console.log('useLogin success')
  })
  return login
}
