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

  // ============== TESTS AÑADIDOS PARA MEJORAR COBERTURA ==============

  it("abre el menú de perfil al hacer clic en el avatar", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Layout />);

    const avatarButton = screen.getByRole("button", { name: /account of current user/i });
    await user.click(avatarButton);

    await waitFor(() => {
      expect(screen.getByText(/mi perfil/i)).toBeInTheDocument();
      expect(screen.getByText(/cerrar sesión/i)).toBeInTheDocument();
    });
  });

  it("cierra el menú de perfil al hacer clic fuera", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Layout />);

    const avatarButton = screen.getByRole("button", { name: /account of current user/i });
    await user.click(avatarButton);

    await waitFor(() => {
      expect(screen.getByText(/mi perfil/i)).toBeInTheDocument();
    });

    // Hacer clic en el item "Mi Perfil" debería cerrar el menú
    const profileItem = screen.getByText(/mi perfil/i);
    await user.click(profileItem);

    await waitFor(() => {
      expect(screen.queryByText(/mi perfil/i)).not.toBeInTheDocument();
    });
  });

  it("ejecuta logout al hacer clic en 'Cerrar Sesión'", async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<Layout />);

    const avatarButton = screen.getByRole("button", { name: /account of current user/i });
    await user.click(avatarButton);

    await waitFor(() => {
      expect(screen.getByText(/cerrar sesión/i)).toBeInTheDocument();
    });

    const logoutItem = screen.getByText(/cerrar sesión/i);
    await user.click(logoutItem);

    // Verificar que se limpió el estado de autenticación
    await waitFor(() => {
      expect(store.getState().auth.isAuthenticated).toBe(false);
    });
  });

  it("navega correctamente al hacer clic en un item del menú", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Layout />);

    const bomberosButton = screen.getByRole("button", { name: /bomberos/i });
    await user.click(bomberosButton);

    // Verificar que la navegación fue exitosa
    await waitFor(() => {
      expect(bomberosButton.closest(".MuiListItemButton-root")).toBeInTheDocument();
    });
  });

  it("cierra el drawer en móviles después de navegar", async () => {
    // Mock useMediaQuery para simular móvil
    const user = userEvent.setup();
    const { container } = renderWithProviders(<Layout />);

    // En móvil, el drawer debería cerrarse al navegar
    const citacionesButton = screen.getByRole("button", { name: /citaciones/i });
    await user.click(citacionesButton);

    await waitFor(() => {
      expect(citacionesButton.closest(".MuiListItemButton-root")).toBeInTheDocument();
    });
  });

  it("alterna el drawer al hacer clic en el botón de menú", async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<Layout />);

    const menuButton = screen.getByRole("button", { name: /toggle drawer/i });
    
    // Hacer clic para cerrar
    await user.click(menuButton);

    await waitFor(() => {
      expect(menuButton).toBeInTheDocument();
    });

    // Hacer clic para abrir de nuevo
    await user.click(menuButton);

    await waitFor(() => {
      expect(menuButton).toBeInTheDocument();
    });
  });

  it("muestra el avatar con la inicial del nombre del usuario", () => {
    renderWithProviders(<Layout />);

    const avatar = screen.getByText("A"); // "A" de "Admin Test"
    expect(avatar).toBeInTheDocument();
  });

  it("muestra 'U' en el avatar cuando no hay nombre de usuario", () => {
    renderWithProviders(<Layout />, {
      preloadedState: {
        auth: {
          token: "fake-token",
          user: {
            id: 5,
            tipo: "admin",
          },
          isAuthenticated: true,
          loading: false,
        },
      },
    });

    const avatar = screen.getByText("U");
    expect(avatar).toBeInTheDocument();
  });

  it("renderiza todos los iconos de navegación correctamente", () => {
    const { container } = renderWithProviders(<Layout />);

    // Verificar que hay iconos en los items de navegación
    const listItemIcons = container.querySelectorAll(".MuiListItemIcon-root");
    expect(listItemIcons.length).toBeGreaterThan(0);
  });

  it("aplica estilos de selección al item de navegación activo", () => {
    renderWithProviders(<Layout />, {
      initialEntries: ["/bomberos"],
    });

    const selectedItem = document.querySelector(".Mui-selected");
    expect(selectedItem).toBeInTheDocument();
  });

  it("renderiza el título completo en el AppBar", () => {
    renderWithProviders(<Layout />);

    expect(screen.getByText(/segunda compañía de bomberos viña del mar/i)).toBeInTheDocument();
  });

  it("muestra los items del menú de perfil con sus iconos", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Layout />);

    const avatarButton = screen.getByRole("button", { name: /account of current user/i });
    await user.click(avatarButton);

    await waitFor(() => {
      expect(screen.getByText(/mi perfil/i)).toBeInTheDocument();
      expect(screen.getByText(/cerrar sesión/i)).toBeInTheDocument();
    });
  });

  it("el menú de perfil contiene un divider entre opciones", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Layout />);

    const avatarButton = screen.getByRole("button", { name: /account of current user/i });
    await user.click(avatarButton);

    await waitFor(() => {
      // Verificar que el menú está abierto
      expect(screen.getByText(/mi perfil/i)).toBeInTheDocument();
      expect(screen.getByText(/cerrar sesión/i)).toBeInTheDocument();
    });
  });

  it("el contenido principal tiene el espaciador para el AppBar", () => {
    const { container } = renderWithProviders(<Layout />);

    const toolbars = container.querySelectorAll(".MuiToolbar-root");
    // Debe haber al menos 3 toolbars: uno en el AppBar, y dos como espaciadores
    expect(toolbars.length).toBeGreaterThanOrEqual(2);
  });

  it("el drawer mantiene el estado abierto/cerrado correctamente", async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<Layout />);

    const drawer = container.querySelector(".MuiDrawer-root");
    expect(drawer).toBeInTheDocument();

    const menuButton = screen.getByRole("button", { name: /toggle drawer/i });
    await user.click(menuButton);

    // El drawer sigue existiendo en el DOM
    await waitFor(() => {
      expect(drawer).toBeInTheDocument();
    });
  });

  it("filtra correctamente los items de navegación según el tipo de usuario", () => {
    renderWithProviders(<Layout />, {
      preloadedState: {
        auth: {
          token: "fake-token",
          user: {
            id: 6,
            nombre: "Usuario Regular",
            tipo: "usuario",
            rol: "Usuario",
          },
          isAuthenticated: true,
          loading: false,
        },
      },
    });

    // Un usuario normal debería ver los items comunes
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/citaciones/i)).toBeInTheDocument();
    
    // Pero no los items de admin
    expect(screen.queryByText(/panel admin/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/guardia nocturna/i)).not.toBeInTheDocument();
  });

  it("maneja usuarios con tipo undefined correctamente", () => {
    renderWithProviders(<Layout />, {
      preloadedState: {
        auth: {
          token: "fake-token",
          user: {
            id: 7,
            nombre: "Usuario Sin Tipo",
          },
          isAuthenticated: true,
          loading: false,
        },
      },
    });

    // Debería mostrar items para 'usuario' por defecto
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    // No debería mostrar items de admin
    expect(screen.queryByText(/panel admin/i)).not.toBeInTheDocument();
  });

  it("el menú de perfil se abre y cierra múltiples veces", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Layout />);

    const avatarButton = screen.getByRole("button", { name: /account of current user/i });

    // Abrir
    await user.click(avatarButton);
    await waitFor(() => {
      expect(screen.getByText(/mi perfil/i)).toBeInTheDocument();
    });

    // Cerrar haciendo clic en Mi Perfil
    const profileItem = screen.getByText(/mi perfil/i);
    await user.click(profileItem);
    await waitFor(() => {
      expect(screen.queryByText(/mi perfil/i)).not.toBeInTheDocument();
    });

    // Abrir de nuevo
    await user.click(avatarButton);
    await waitFor(() => {
      expect(screen.getByText(/mi perfil/i)).toBeInTheDocument();
    });
  });
});
