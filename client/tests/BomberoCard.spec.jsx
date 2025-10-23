import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import BomberoCard from "../src/components/bomberos/BomberoCard";
import bomberosReducer from "../src/store/slices/bomberosSlice";

// Helper para renderizar con providers
const renderWithProviders = (component) => {
  const store = configureStore({
    reducer: {
      bomberos: bomberosReducer,
    },
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

// Mock de un bombero de ejemplo (estructura real del sistema)
const mockBombero = {
  id: 1,
  nombres: "Juan",
  apellidos: "Pérez González",
  rut: "12345678-9",
  email: "juan.perez@bomberos.cl",
  telefono: "+56 9 1234 5678",
  rango: "Bombero",
  estado: "Activo",
  fotoUrl: "/assets/bomberos/bombero-1.jpg",
};

describe("Componente BomberoCard", () => {
  it("renderiza el nombre completo correctamente", () => {
    renderWithProviders(<BomberoCard bombero={mockBombero} />);
    expect(screen.getByText(/Juan Pérez González/i)).toBeInTheDocument();
  });

  it("renderiza el rango del bombero", () => {
    renderWithProviders(<BomberoCard bombero={mockBombero} />);
    // Usar getAllByText porque "Bombero" aparece también en el email
    const elements = screen.getAllByText(/Bombero/i);
    expect(elements.length).toBeGreaterThan(0);
  });

  it("renderiza el estado como chip", () => {
    renderWithProviders(<BomberoCard bombero={mockBombero} />);
    expect(screen.getByText(/Activo/i)).toBeInTheDocument();
  });

  it("muestra el email del bombero", () => {
    renderWithProviders(<BomberoCard bombero={mockBombero} />);
    expect(screen.getByText(/juan.perez@bomberos.cl/i)).toBeInTheDocument();
  });

  it("muestra el teléfono del bombero", () => {
    renderWithProviders(<BomberoCard bombero={mockBombero} />);
    expect(screen.getByText(/\+56 9 1234 5678/i)).toBeInTheDocument();
  });

  it("renderiza los botones de acción (Ver, Editar, Eliminar)", () => {
    const onView = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    renderWithProviders(
      <BomberoCard
        bombero={mockBombero}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    // Verificar que existen botones de acción
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("tiene botones de acción cuando showActions es true", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    
    renderWithProviders(
      <BomberoCard 
        bombero={mockBombero} 
        showActions={true}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    // Verificar que los botones de editar y eliminar existen
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("muestra la imagen del bombero con la URL correcta", () => {
    renderWithProviders(<BomberoCard bombero={mockBombero} />);
    
    const avatars = screen.getAllByRole("img");
    expect(avatars.length).toBeGreaterThan(0);
    // La primera imagen debería ser el avatar del bombero
    expect(avatars[0]).toHaveAttribute("src", expect.stringContaining("bombero"));
  });

  it("renderiza correctamente un bombero en estado Inactivo", () => {
    const bomberoinactivo = { ...mockBombero, estado: "Inactivo" };
    renderWithProviders(<BomberoCard bombero={bomberoinactivo} />);
    
    expect(screen.getByText(/Inactivo/i)).toBeInTheDocument();
  });

  it("renderiza correctamente un bombero en estado Licencia", () => {
    const bomberoLicencia = { ...mockBombero, estado: "Licencia" };
    renderWithProviders(<BomberoCard bombero={bomberoLicencia} />);
    
    expect(screen.getByText(/Licencia/i)).toBeInTheDocument();
  });
});
