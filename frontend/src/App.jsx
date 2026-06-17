import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import { TodoProvider } from "./context/TodoContext";
import { AuthProvider } from "./context/auth-context";
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TodoProvider>
          <AppRoutes />
        </TodoProvider>
      </AuthProvider>
      <ToastContainer />
    </BrowserRouter>
  );
}
export default App;
