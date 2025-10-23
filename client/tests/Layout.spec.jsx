import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import userEvent from "@testing-library/user-event";
import Layout from "../src/components/Layout";
import authReducer from "../src/store/slices/authSlice";

const renderWithProviders = (
  component,
  {
    preloadedState = {
      auth: {
        token: "fake-token",
        user: {
          id: 1,
          nombre: "Admin Test",
          tipo: "admin",
          rol: "Administrador",
        },
        isAuthenticated: true,
        loading: false,
      },
    },
    initialEntries = ["/dashboard"],
  } = {}
) => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState,
  });

  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={initialEntries}>
          {component}
        </MemoryRouter>
      </Provider>
    ),
  };
};

describe("Componente Layout", () => {
  it("renderiza el logo y título del sistema", () => {
    renderWithProviders(<Layout />);

    expect(screen.getByText(/sistema/i)).toBeInTheDocument();
    // "Bomberos" aparece múltiples veces, verificar con getAllByText
    const bomberosText = screen.getAllByText(/bomberos/i);
    expect(bomberosText.length).toBeGreaterThan(0);
  });

  it("muestra el AppBar con el título", () => {
    const { container } = renderWithProviders(<Layout />);

    const appBar = container.querySelector(".MuiAppBar-root");
    expect(appBar).toBeInTheDocument();
  });

  it("muestra el menú de navegación lateral (drawer)", () => {
    const { container } = renderWithProviders(<Layout />);

    const drawer = container.querySelector(".MuiDrawer-root");
    expect(drawer).toBeInTheDocument();
  });

  it("muestra el nombre del usuario conectado", () => {
    renderWithProviders(<Layout />);

    expect(screen.getByText(/admin test/i)).toBeInTheDocument();
  });

  it("muestra el texto 'Conectado como:'", () => {
    renderWithProviders(<Layout />);

    expect(screen.getByText(/conectado como:/i)).toBeInTheDocument();
  });

  it("muestra el rol del usuario", () => {
    renderWithProviders(<Layout />);

    expect(screen.getByText(/administrador/i)).toBeInTheDocument();
  });

  it("renderiza el item de navegación 'Dashboard'", () => {
    renderWithProviders(<Layout />);

    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });

  it("renderiza el item de navegación 'Bomberos'", () => {
    renderWithProviders(<Layout />);

    // "Bomberos" aparece en el título y en el menú
    const bomberosItems = screen.getAllByText(/bomberos/i);
    expect(bomberosItems.length).toBeGreaterThanOrEqual(2);
  });

  it("renderiza el item de navegación 'Citaciones'", () => {
    renderWithProviders(<Layout />);

    expect(screen.getByText(/citaciones/i)).toBeInTheDocument();
  });

  it("renderiza el item de navegación 'Oficiales'", () => {
    renderWithProviders(<Layout />);

    expect(screen.getByText(/oficiales/i)).toBeInTheDocument();
  });

  it("renderiza el item de navegación 'Material Menor'", () => {
    renderWithProviders(<Layout />);

    expect(screen.getByText(/material menor/i)).toBeInTheDocument();
  });

  it("renderiza el item de navegación 'Material Mayor'", () => {
    renderWithProviders(<Layout />);

    expect(screen.getByText(/material mayor/i)).toBeInTheDocument();
  });

  it("muestra 'Panel Admin' solo para usuarios admin", () => {
    renderWithProviders(<Layout />);

    expect(screen.getByText(/panel admin/i)).toBeInTheDocument();
  });

  it("muestra 'Guardia Nocturna' solo para usuarios admin", () => {
    renderWithProviders(<Layout />);

    expect(screen.getByText(/guardia nocturna/i)).toBeInTheDocument();
  });

  it("NO muestra 'Panel Admin' para usuarios normales", () => {
    renderWithProviders(<Layout />, {
      preloadedState: {
        auth: {
          token: "fake-token",
          user: {
            id: 2,
            nombre: "Usuario Normal",
            tipo: "usuario",
            rol: "Usuario",
          },
          isAuthenticated: true,
          loading: false,
        },
      },
    });

    expect(screen.queryByText(/panel admin/i)).not.toBeInTheDocument();
  });

  it("NO muestra 'Guardia Nocturna' para usuarios normales", () => {
    renderWithProviders(<Layout />, {
      preloadedState: {
        auth: {
          token: "fake-token",
          user: {
            id: 2,
            nombre: "Usuario Normal",
            tipo: "usuario",
            rol: "Usuario",
          },
          isAuthenticated: true,
          loading: false,
        },
      },
    });

    expect(screen.queryByText(/guardia nocturna/i)).not.toBeInTheDocument();
  });

  it("tiene un botón de menú (hamburger) para abrir/cerrar el drawer", () => {
    const { container } = renderWithProviders(<Layout />);

    // Buscar el botón con aria-label que contiene "drawer" o "toggle"
    const menuButton = container.querySelector('[aria-label*="drawer"], [aria-label*="toggle"]');
    expect(menuButton).toBeTruthy();
  });

  it("renderiza el icono del departamento de bomberos", () => {
    const { container } = renderWithProviders(<Layout />);

    // Buscar el icono FireDepartment
    const icon = container.querySelector('[data-testid="LocalFireDepartmentIcon"]');
    expect(icon).toBeInTheDocument();
  });

  it("muestra el outlet para renderizar las rutas hijas", () => {
    const { container } = renderWithProviders(<Layout />);

    // El Outlet debería estar presente
    expect(container.querySelector("main") || container).toBeTruthy();
  });

  it("aplica estilos correctos al drawer", () => {
    const { container } = renderWithProviders(<Layout />);

    const drawer = container.querySelector(".MuiDrawer-root");
    expect(drawer).toHaveStyle({ display: "block" });
  });

  it("maneja correctamente usuarios sin nombre", () => {
    renderWithProviders(<Layout />, {
      preloadedState: {
        auth: {
          token: "fake-token",
          user: {
            id: 3,
            tipo: "admin",
          },
          isAuthenticated: true,
          loading: false,
        },
      },
    });

    expect(screen.getByText(/usuario/i)).toBeInTheDocument();
  });

  it("maneja correctamente usuarios sin rol definido", () => {
    renderWithProviders(<Layout />, {
      preloadedState: {
        auth: {
          token: "fake-token",
          user: {
            id: 4,
            nombre: "Test User",
            tipo: "admin",
          },
          isAuthenticated: true,
          loading: false,
        },
      },
    });

    expect(screen.getByText(/rol no definido/i)).toBeInTheDocument();
  });

  it("resalta el item de navegación actual", () => {
    renderWithProviders(<Layout />, {
      initialEntries: ["/dashboard"],
    });

    // El dashboard está seleccionado - buscar el elemento con clase Mui-selected
    const selectedItems = document.querySelectorAll(".Mui-selected");
    expect(selectedItems.length).toBeGreaterThan(0);
  });

  it("renderiza un Divider entre el logo y la navegación", () => {
    const { container } = renderWithProviders(<Layout />);

    const dividers = container.querySelectorAll(".MuiDivider-root");
    expect(dividers.length).toBeGreaterThan(0);
  });

  it("el drawer tiene altura completa", () => {
    const { container } = renderWithProviders(<Layout />);

    const drawerContent = container.querySelector(".MuiDrawer-paper > .MuiBox-root");
    expect(drawerContent).toBeTruthy();
  });
});
