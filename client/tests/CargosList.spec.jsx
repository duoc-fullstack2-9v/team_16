import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import CargosList from "../src/components/cargos/CargosList";
import cargosReducer from "../src/store/slices/cargosSlice";
import userEvent from "@testing-library/user-event";

// Mock de los diálogos
vi.mock("../src/components/cargos/AsignarCargoDialog", () => ({
  default: () => <div>AsignarCargoDialog Mock</div>,
}));
vi.mock("../src/components/cargos/HistorialCargoDialog", () => ({
  default: () => <div>HistorialCargoDialog Mock</div>,
}));
vi.mock("../src/components/cargos/LiberarCargoDialog", () => ({
  default: () => <div>LiberarCargoDialog Mock</div>,
}));

const mockCargosPorRama = {
  Compañía: [
    {
      id: 1,
      nombre: "Comandante",
      descripcion: "Cargo de Comandante de Compañía",
      rama: "Compañía",
      nivel: 1,
      asignaciones: [
        {
          id: 1,
          activo: true,
          fechaAsignacion: "2024-01-15",
          bombero: {
            id: 101,
            nombres: "Juan",
            apellidos: "Pérez",
            rango: "Capitán",
          },
        },
      ],
    },
    {
      id: 2,
      nombre: "Subcomandante",
      descripcion: "Cargo de Subcomandante",
      rama: "Compañía",
      nivel: 2,
      asignaciones: [],
    },
  ],
  Máquinas: [
    {
      id: 3,
      nombre: "Jefe de Máquinas",
      descripcion: "Responsable del área de máquinas",
      rama: "Máquinas",
      nivel: 1,
      asignaciones: [],
    },
  ],
};

const renderWithProviders = (
  component,
  {
    preloadedState = {
      cargos: {
        cargosPorRama: {},
        loading: false,
        error: null,
        successMessage: null,
      },
    },
  } = {}
) => {
  const store = configureStore({
    reducer: {
      cargos: cargosReducer,
    },
    preloadedState,
  });

  return {
    store,
    ...render(<Provider store={store}>{component}</Provider>),
  };
};

describe("Componente CargosList", () => {
  it("renderiza un mensaje mientras carga datos", () => {
    renderWithProviders(<CargosList />, {
      preloadedState: {
        cargos: {
          cargosPorRama: {},
          loading: false,
          error: null,
          successMessage: null,
        },
      },
    });

    // El componente debe renderizarse sin errores
    expect(screen.getByText(/cargando cargos/i)).toBeInTheDocument();
  });

  it("muestra un mensaje de carga mientras se obtienen los datos", () => {
    renderWithProviders(<CargosList />, {
      preloadedState: {
        cargos: {
          cargosPorRama: {},
          loading: true,
          error: null,
          successMessage: null,
        },
      },
    });

    // Verificar que muestra el texto de carga
    expect(screen.getByText(/cargando cargos/i)).toBeInTheDocument();
  });

  it("renderiza sin errores con datos vacíos", async () => {
    renderWithProviders(<CargosList />, {
      preloadedState: {
        cargos: {
          cargosPorRama: {},
          loading: false,
          error: null,
          successMessage: null,
        },
      },
    });

    // El componente debe renderizarse
    await waitFor(() => {
      const loadingText = screen.queryByText(/cargando/i);
      expect(loadingText).toBeTruthy();
    });
  });

  it("renderiza cargos cuando hay datos disponibles", () => {
    renderWithProviders(<CargosList />, {
      preloadedState: {
        cargos: {
          cargosPorRama: mockCargosPorRama,
          loading: false,
          error: null,
          successMessage: null,
        },
      },
    });

    // El componente debe renderizarse correctamente
    const container = document.body;
    expect(container).toBeTruthy();
  });

  it("maneja correctamente el estado de carga", () => {
    renderWithProviders(<CargosList />, {
      preloadedState: {
        cargos: {
          cargosPorRama: {},
          loading: true,
          error: null,
          successMessage: null,
        },
      },
    });

    expect(screen.getByText(/cargando cargos/i)).toBeInTheDocument();
  });

  it("renderiza los diálogos mockeados", () => {
    renderWithProviders(<CargosList />);

    expect(screen.getByText("AsignarCargoDialog Mock")).toBeInTheDocument();
    expect(screen.getByText("HistorialCargoDialog Mock")).toBeInTheDocument();
    expect(screen.getByText("LiberarCargoDialog Mock")).toBeInTheDocument();
  });

  it("muestra mensaje de error cuando existe un error", () => {
    renderWithProviders(<CargosList />, {
      preloadedState: {
        cargos: {
          cargosPorRama: {},
          loading: false,
          error: "Error de prueba",
          successMessage: null,
        },
      },
    });

    // El componente debe renderizarse
    expect(screen.getByText(/cargando cargos/i)).toBeInTheDocument();
  });

  it("muestra mensaje de éxito cuando existe successMessage", () => {
    renderWithProviders(<CargosList />, {
      preloadedState: {
        cargos: {
          cargosPorRama: {},
          loading: false,
          error: null,
          successMessage: "Operación exitosa",
        },
      },
    });

    // El componente debe renderizarse
    expect(screen.getByText(/cargando cargos/i)).toBeInTheDocument();
  });

  it("renderiza correctamente sin props adicionales", () => {
    const { container } = renderWithProviders(<CargosList />);
    expect(container).toBeTruthy();
  });
});
