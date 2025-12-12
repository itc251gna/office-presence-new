import { Routes, Route, Navigate } from 'react-router-dom'
export default function App(){
  return (
    <Routes>
      <Route path="/" element={<div className="p-10 text-slate-900 dark:text-white">Frontend OK</div>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
