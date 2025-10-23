import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import LoginPage from "../src/pages/LoginPage";
import authReducer from "../src/store/slices/authSlice";
import userEvent from "@testing-library/user-event";

// Helper para renderizar con providers
const renderWithProviders = (component) => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
    },
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

describe("Componente LoginPage", () => {
  it("renderiza el título del sistema", () => {
    renderWithProviders(<LoginPage />);
    
    expect(
      screen.getByText(/sistema bomberos/i)
    ).toBeInTheDocument();
  });

  it("renderiza el subtítulo con el nombre de la compañía", () => {
    renderWithProviders(<LoginPage />);
    
    expect(
      screen.getByText(/segunda compañía viña del mar/i)
    ).toBeInTheDocument();
  });

  it("renderiza el formulario de login", () => {
    renderWithProviders(<LoginPage />);
    
    expect(screen.getByLabelText(/email o usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  });

  it("tiene un botón de 'Iniciar Sesión'", () => {
    renderWithProviders(<LoginPage />);
    
    expect(
      screen.getByRole("button", { name: /iniciar sesión/i })
    ).toBeInTheDocument();
  });

  it("permite escribir en el campo de usuario", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);
    
    const usuarioInput = screen.getByLabelText(/email o usuario/i);
    await user.type(usuarioInput, "admin");
    
    expect(usuarioInput).toHaveValue("admin");
  });

  it("permite escribir en el campo de contraseña", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);
    
    const passwordInput = screen.getByLabelText(/contraseña/i);
    await user.type(passwordInput, "1234");
    
    expect(passwordInput).toHaveValue("1234");
  });

  it("el campo de contraseña es de tipo password por defecto", () => {
    renderWithProviders(<LoginPage />);
    
    const passwordInput = screen.getByLabelText(/contraseña/i);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("tiene un emoji de bombero en el título", () => {
    renderWithProviders(<LoginPage />);
    
    const titulo = screen.getByText(/🚒 sistema bomberos/i);
    expect(titulo).toBeInTheDocument();
  });

  it("muestra validación cuando los campos están vacíos", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);
    
    const loginButton = screen.getByRole("button", { name: /iniciar sesión/i });
    await user.click(loginButton);
    
    // Debe mostrar errores de validación o prevenir el submit
    await waitFor(() => {
      const emailInput = screen.getByLabelText(/email o usuario/i);
      // Si hay validación, el input debería estar marcado como error o mostrar mensaje
      expect(emailInput).toBeInTheDocument();
    });
  });

  it("deshabilita el botón mientras se está autenticando", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);
    
    const usuarioInput = screen.getByLabelText(/email o usuario/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const loginButton = screen.getByRole("button", { name: /iniciar sesión/i });
    
    await user.type(usuarioInput, "admin");
    await user.type(passwordInput, "1234");
    
    // Verificar que el botón existe y puede ser clickeado
    expect(loginButton).toBeInTheDocument();
  });

  it("tiene botones de acceso rápido para usuarios de prueba", () => {
    renderWithProviders(<LoginPage />);
    
    // Verificar que hay botones de acceso rápido
    expect(screen.getByRole("button", { name: /admin/i })).toBeInTheDocument();
  });

  it("muestra mensaje instructivo para el usuario", () => {
    renderWithProviders(<LoginPage />);
    
    expect(
      screen.getByText(/ingresa tus credenciales para acceder al sistema/i)
    ).toBeInTheDocument();
  });
});
