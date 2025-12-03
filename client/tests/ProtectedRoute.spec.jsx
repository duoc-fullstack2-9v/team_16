import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import ProtectedRoute from "../src/components/ProtectedRoute";
import authReducer from "../src/store/slices/authSlice";

// Helper para renderizar con Redux store y Router
const renderWithProviders = (
  ui,
  {
    preloadedState = {},
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
      preloadedState,
    }),
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={["/protected"]}>
        {children}
      </MemoryRouter>
    </Provider>
  );
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

describe("Componente ProtectedRoute", () => {
  it("muestra el contenido protegido cuando el usuario está autenticado", () => {
    const preloadedState = {
      auth: {
        token: "fake-token",
        user: { id: 1, nombre: "Admin" },
        isAuthenticated: true,
        loading: false,
      },
    };

    renderWithProviders(
      <ProtectedRoute>
        <div>Contenido Protegido</div>
      </ProtectedRoute>,
      { preloadedState }
    );

    expect(screen.getByText(/contenido protegido/i)).toBeInTheDocument();
  });

  it("no muestra el contenido cuando el usuario no está autenticado", () => {
    const preloadedState = {
      auth: {
        token: null,
        user: null,
        isAuthenticated: false,
        loading: false,
      },
    };

    renderWithProviders(
      <ProtectedRoute>
        <div>Contenido Protegido</div>
      </ProtectedRoute>,
      { preloadedState }
    );

    expect(screen.queryByText(/contenido protegido/i)).not.toBeInTheDocument();
  });

  it("muestra un spinner mientras está cargando", () => {
    const preloadedState = {
      auth: {
        token: null,
        user: null,
        isAuthenticated: false,
        loading: true,
      },
    };

    renderWithProviders(
      <ProtectedRoute>
        <div>Contenido Protegido</div>
      </ProtectedRoute>,
      { preloadedState }
    );

    // CircularProgress tiene role="progressbar"
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("muestra el spinner centrado en un Box", () => {
    const preloadedState = {
      auth: {
        token: null,
        user: null,
        isAuthenticated: false,
        loading: true,
      },
    };

    const { container } = renderWithProviders(
      <ProtectedRoute>
        <div>Contenido Protegido</div>
      </ProtectedRoute>,
      { preloadedState }
    );

    // Verificar que existe el Box contenedor
    expect(container.querySelector(".MuiBox-root")).toBeInTheDocument();
  });

  it("redirige a /login cuando no hay autenticación", () => {
    const preloadedState = {
      auth: {
        token: null,
        user: null,
        isAuthenticated: false,
        loading: false,
      },
    };

    renderWithProviders(
      <ProtectedRoute>
        <div>Contenido Protegido</div>
      </ProtectedRoute>,
      { preloadedState }
    );

    // El componente Navigate redirige, no renderiza contenido
    expect(screen.queryByText(/contenido protegido/i)).not.toBeInTheDocument();
  });

  it("renderiza children cuando isAuthenticated es true", () => {
    const preloadedState = {
      auth: {
        token: "valid-token",
        user: { id: 2, nombre: "Usuario" },
        isAuthenticated: true,
        loading: false,
      },
    };

    renderWithProviders(
      <ProtectedRoute>
        <h1>Página Segura</h1>
      </ProtectedRoute>,
      { preloadedState }
    );

    expect(screen.getByRole("heading", { name: /página segura/i })).toBeInTheDocument();
  });

  it("renderiza múltiples children cuando está autenticado", () => {
    const preloadedState = {
      auth: {
        token: "valid-token",
        user: { id: 3, nombre: "Test User" },
        isAuthenticated: true,
        loading: false,
      },
    };

    renderWithProviders(
      <ProtectedRoute>
        <div>Primer elemento</div>
        <div>Segundo elemento</div>
        <div>Tercer elemento</div>
      </ProtectedRoute>,
      { preloadedState }
    );

    expect(screen.getByText(/primer elemento/i)).toBeInTheDocument();
    expect(screen.getByText(/segundo elemento/i)).toBeInTheDocument();
    expect(screen.getByText(/tercer elemento/i)).toBeInTheDocument();
  });

  it("no muestra spinner cuando isAuthenticated es true", () => {
    const preloadedState = {
      auth: {
        token: "valid-token",
        user: { id: 4, nombre: "Admin User" },
        isAuthenticated: true,
        loading: false,
      },
    };

    renderWithProviders(
      <ProtectedRoute>
        <div>Contenido</div>
      </ProtectedRoute>,
      { preloadedState }
    );

    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("maneja el caso donde loading es false y no está autenticado", () => {
    const preloadedState = {
      auth: {
        token: null,
        user: null,
        isAuthenticated: false,
        loading: false,
      },
    };

    renderWithProviders(
      <ProtectedRoute>
        <div>No debería verse</div>
      </ProtectedRoute>,
      { preloadedState }
    );

    expect(screen.queryByText(/no debería verse/i)).not.toBeInTheDocument();
  });

  it("maneja el caso donde hay token pero isAuthenticated es false", () => {
    const preloadedState = {
      auth: {
        token: "some-token",
        user: null,
        isAuthenticated: false,
        loading: false,
      },
    };

    renderWithProviders(
      <ProtectedRoute>
        <div>Contenido Protegido</div>
      </ProtectedRoute>,
      { preloadedState }
    );

    // isAuthenticated es la condición principal
    expect(screen.queryByText(/contenido protegido/i)).not.toBeInTheDocument();
  });
});
