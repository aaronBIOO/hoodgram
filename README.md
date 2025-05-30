### README documentation coming soon!

import { Routes, Route } from "react-router-dom";
import SigninForm from "./_auth/forms/SigninForm";
import SignupForm from "./_auth/forms/SignupForm";
import { Home } from "./_root/pages";
import './globals.css';
import { AuthLayout } from "./_auth/layout";


const App = () => {

  return (
    <main className="flex h-screen">
      <Routes>
        <Route element={<AuthLayout />}>
          {/* public routes */}
          <Route path="/sign-in" element={<SigninForm />}/>
          <Route path="/sign-up" element={<SignupForm />}/>
        </Route>
        
        <Route element={<RootLayout />}>
          {/* private routes */}
          <Route index element={<Home />}/>
        </Route>
      </Routes>
    </main>
  )
}

export default App

two folders created:
_auth/forms/
     SigninForm.tsx
     SignupForm.tsx
_auth/
  AuthLayout.tsx


_root/
  pages/
    Home.tsx
    index.ts 
-----------------
index.ts 
export { default as Home } from "./Home";



_root/
  layout.tsx

------------------------

