import { Suspense } from "react"
import RegisterForm from "./RegisterForm"

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>Loading...</div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
