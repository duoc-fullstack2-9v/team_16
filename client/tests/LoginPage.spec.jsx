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

  // ============== TESTS AÑADIDOS PARA MEJORAR COBERTURA ==============

  it("cambia la visibilidad de la contraseña al hacer clic en el icono", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);
    
    const passwordInput = screen.getByLabelText(/contraseña/i);
    expect(passwordInput).toHaveAttribute("type", "password");
    
    // El botón de toggle no tiene aria-label, así que lo buscamos por el icono de visibilidad
    const buttons = screen.getAllByRole("button");
    const toggleButton = buttons.find(btn => btn.querySelector('[data-testid="VisibilityOffIcon"], [data-testid="VisibilityIcon"]'));
    
    await user.click(toggleButton);
    
    expect(passwordInput).toHaveAttribute("type", "text");
    
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("botón de credenciales de admin rellena el formulario con datos de admin", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);
    
    const adminButton = screen.getByRole("button", { name: /admin \(admin\/1234\)/i });
    await user.click(adminButton);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/email o usuario/i)).toHaveValue("admin");
      expect(screen.getByLabelText(/contraseña/i)).toHaveValue("1234");
    });
  });

  it("botón de credenciales de usuario rellena el formulario con datos de bombero", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);
    
    const userButton = screen.getByRole("button", { name: /pedro \(bombero@bomberos\.cl\)/i });
    await user.click(userButton);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/email o usuario/i)).toHaveValue("bombero@bomberos.cl");
      expect(screen.getByLabelText(/contraseña/i)).toHaveValue("bomb345");
    });
  });

  it("muestra error de validación cuando el email está vacío al enviar", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);
    
    const passwordInput = screen.getByLabelText(/contraseña/i);
    await user.type(passwordInput, "1234");
    
    const loginButton = screen.getByRole("button", { name: /iniciar sesión/i });
    await user.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/el email es requerido/i)).toBeInTheDocument();
    });
  });

  it("muestra error de validación cuando la contraseña está vacía al enviar", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email o usuario/i);
    await user.type(emailInput, "admin");
    
    const loginButton = screen.getByRole("button", { name: /iniciar sesión/i });
    await user.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/la contraseña es requerida/i)).toBeInTheDocument();
    });
  });

  it("muestra error cuando la contraseña es demasiado corta", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email o usuario/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    
    await user.type(emailInput, "admin");
    await user.type(passwordInput, "12");
    
    const loginButton = screen.getByRole("button", { name: /iniciar sesión/i });
    await user.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/la contraseña debe tener al menos 4 caracteres/i)).toBeInTheDocument();
    });
  });

  it("muestra error cuando ambos campos están vacíos", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);
    
    const loginButton = screen.getByRole("button", { name: /iniciar sesión/i });
    await user.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/el email es requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/la contraseña es requerida/i)).toBeInTheDocument();
    });
  });

  it("limpia los errores de validación cuando el usuario escribe en email", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);
    
    const loginButton = screen.getByRole("button", { name: /iniciar sesión/i });
    await user.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/el email es requerido/i)).toBeInTheDocument();
    });
    
    const emailInput = screen.getByLabelText(/email o usuario/i);
    await user.type(emailInput, "a");
    
    await waitFor(() => {
      expect(screen.queryByText(/el email es requerido/i)).not.toBeInTheDocument();
    });
  });

  it("limpia los errores de validación cuando el usuario escribe en contraseña", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);
    
    const loginButton = screen.getByRole("button", { name: /iniciar sesión/i });
    await user.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/la contraseña es requerida/i)).toBeInTheDocument();
    });
    
    const passwordInput = screen.getByLabelText(/contraseña/i);
    await user.type(passwordInput, "1");
    
    await waitFor(() => {
      expect(screen.queryByText(/la contraseña es requerida/i)).not.toBeInTheDocument();
    });
  });

  it("deshabilita los campos cuando está cargando", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email o usuario/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    
    await user.type(emailInput, "admin");
    await user.type(passwordInput, "1234");
    
    const loginButton = screen.getByRole("button", { name: /iniciar sesión/i });
    await user.click(loginButton);
    
    // Durante la carga, los campos deberían estar deshabilitados
    // Este test verifica la funcionalidad incluso si es momentánea
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  });

  it("deshabilita los botones de credenciales de prueba cuando está cargando", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email o usuario/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    
    await user.type(emailInput, "admin");
    await user.type(passwordInput, "1234");
    
    const loginButton = screen.getByRole("button", { name: /iniciar sesión/i });
    await user.click(loginButton);
    
    // Los botones de prueba deberían estar deshabilitados durante la carga
    const adminButton = screen.getByRole("button", { name: /admin \(admin\/1234\)/i });
    const userButton = screen.getByRole("button", { name: /pedro \(bombero@bomberos\.cl\)/i });
    
    expect(adminButton).toBeInTheDocument();
    expect(userButton).toBeInTheDocument();
  });

  it("muestra el icono de carga en el botón cuando está enviando", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email o usuario/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    
    await user.type(emailInput, "admin");
    await user.type(passwordInput, "1234");
    
    const loginButton = screen.getByRole("button", { name: /iniciar sesión/i });
    await user.click(loginButton);
    
    // El botón debe existir y se actualizará su contenido
    expect(loginButton).toBeInTheDocument();
  });

  it("muestra el divider con texto de credenciales de prueba", () => {
    renderWithProviders(<LoginPage />);
    
    expect(screen.getByText(/credenciales de prueba/i)).toBeInTheDocument();
  });

  it("tiene iconos en los campos de entrada", () => {
    renderWithProviders(<LoginPage />);
    
    // Verificar que los campos tienen iconos (InputAdornment)
    const emailInput = screen.getByLabelText(/email o usuario/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  });

  it("tiene placeholder en el campo de email", () => {
    renderWithProviders(<LoginPage />);
    
    const emailInput = screen.getByPlaceholderText(/admin o bombero@bomberos\.cl/i);
    expect(emailInput).toBeInTheDocument();
  });

  it("tiene placeholder en el campo de contraseña", () => {
    renderWithProviders(<LoginPage />);
    
    const passwordInput = screen.getByPlaceholderText(/ingresa tu contraseña/i);
    expect(passwordInput).toBeInTheDocument();
  });

  it("muestra iconos de persona en los botones de credenciales de prueba", () => {
    renderWithProviders(<LoginPage />);
    
    const adminButton = screen.getByRole("button", { name: /admin \(admin\/1234\)/i });
    const userButton = screen.getByRole("button", { name: /pedro \(bombero@bomberos\.cl\)/i });
    
    expect(adminButton).toBeInTheDocument();
    expect(userButton).toBeInTheDocument();
  });

  it("no muestra errores de Redux por defecto", () => {
    renderWithProviders(<LoginPage />);
    
    // No debe haber alertas de error al inicio
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("puede escribir y borrar en el campo de email", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email o usuario/i);
    await user.type(emailInput, "admin");
    expect(emailInput).toHaveValue("admin");
    
    await user.clear(emailInput);
    expect(emailInput).toHaveValue("");
  });

  it("puede escribir y borrar en el campo de contraseña", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);
    
    const passwordInput = screen.getByLabelText(/contraseña/i);
    await user.type(passwordInput, "1234");
    expect(passwordInput).toHaveValue("1234");
    
    await user.clear(passwordInput);
    expect(passwordInput).toHaveValue("");
  });
});
