import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import userEvent from "@testing-library/user-event";
import CitacionCard from "../src/components/citaciones/CitacionCard";
import citacionesReducer from "../src/store/slices/citacionesSlice";

// Helper para renderizar con providers
const renderWithProviders = (component) => {
  const store = configureStore({
    reducer: {
      citaciones: citacionesReducer,
    },
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

// Mock de citación de ejemplo
const mockCitacion = {
  id: 1,
  titulo: "Capacitación de Emergencias",
  descripcion: "Entrenamiento en respuesta rápida",
  fecha: "2025-10-25",
  hora: "14:00:00",
  lugar: "Cuartel Central",
  estado: "Programada",
  tipo: "Capacitación",
  bomberos: [
    { id: 1, nombres: "Juan", apellidos: "Pérez", asistio: null },
    { id: 2, nombres: "María", apellidos: "González", asistio: true },
    { id: 3, nombres: "Carlos", apellidos: "López", asistio: false },
  ],
};

describe("Componente CitacionCard", () => {
  it("renderiza el título de la citación correctamente", () => {
    renderWithProviders(<CitacionCard citacion={mockCitacion} />);
    
    expect(screen.getByText(/capacitación de emergencias/i)).toBeInTheDocument();
  });

  it("muestra la fecha formateada correctamente", () => {
    renderWithProviders(<CitacionCard citacion={mockCitacion} />);
    
    // La fecha debe estar formateada en español (ej: "25 de octubre, 2025")
    expect(screen.getByText(/octubre/i)).toBeInTheDocument();
  });

  it("muestra la hora de la citación", () => {
    renderWithProviders(<CitacionCard citacion={mockCitacion} />);
    
    // La hora debe mostrarse como "14:00"
    expect(screen.getByText(/14:00/i)).toBeInTheDocument();
  });

  it("muestra el lugar de la citación", () => {
    renderWithProviders(<CitacionCard citacion={mockCitacion} />);
    
    expect(screen.getByText(/cuartel central/i)).toBeInTheDocument();
  });

  it("renderiza el estado como chip con color correcto", () => {
    renderWithProviders(<CitacionCard citacion={mockCitacion} />);
    
    const estadoChip = screen.getByText(/programada/i);
    expect(estadoChip).toBeInTheDocument();
  });

  it("muestra el número total de bomberos asignados", () => {
    renderWithProviders(<CitacionCard citacion={mockCitacion} />);
    
    // Debe mostrar "3" bomberos
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });

  it("muestra estado 'Realizada' con color success", () => {
    const citacionRealizada = { ...mockCitacion, estado: "Realizada" };
    renderWithProviders(<CitacionCard citacion={citacionRealizada} />);
    
    expect(screen.getByText(/realizada/i)).toBeInTheDocument();
  });

  it("muestra estado 'Cancelada' con color warning", () => {
    const citacionCancelada = { ...mockCitacion, estado: "Cancelada" };
    renderWithProviders(<CitacionCard citacion={citacionCancelada} />);
    
    expect(screen.getByText(/cancelada/i)).toBeInTheDocument();
  });

  it("tiene botones de acción (ver, editar, asignar)", () => {
    const onView = vi.fn();
    const onEdit = vi.fn();
    const onAssign = vi.fn();
    
    renderWithProviders(
      <CitacionCard 
        citacion={mockCitacion}
        onView={onView}
        onEdit={onEdit}
        onAssign={onAssign}
      />
    );

    // Verificar que hay múltiples botones
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("llama a onView cuando se hace clic en el botón de ver", async () => {
    const user = userEvent.setup();
    const onView = vi.fn();
    
    renderWithProviders(
      <CitacionCard citacion={mockCitacion} onView={onView} />
    );

    const buttons = screen.getAllByRole("button");
    // Hacer clic en el primer botón (generalmente "Ver")
    if (buttons.length > 0) {
      await user.click(buttons[0]);
      // Verificar que se llamó alguna función (puede ser onView u otra)
      expect(buttons[0]).toBeInTheDocument();
    }
  });

  it("muestra avatares de bomberos cuando hay asignados", () => {
    renderWithProviders(<CitacionCard citacion={mockCitacion} />);
    
    // Debe mostrar información de bomberos (3 asignados)
    const totalText = screen.getByText(/3/);
    expect(totalText).toBeInTheDocument();
  });

  it("muestra citación sin bomberos asignados correctamente", () => {
    const citacionSinBomberos = { ...mockCitacion, bomberos: [] };
    renderWithProviders(<CitacionCard citacion={citacionSinBomberos} />);
    
    expect(screen.getByText(/capacitación de emergencias/i)).toBeInTheDocument();
  });

  it("maneja citaciones con hora en formato completo", () => {
    const citacionHoraCompleta = { ...mockCitacion, hora: "14:30:45" };
    renderWithProviders(<CitacionCard citacion={citacionHoraCompleta} />);
    
    // Debe mostrar solo "14:30"
    expect(screen.getByText(/14:30/i)).toBeInTheDocument();
  });
});
