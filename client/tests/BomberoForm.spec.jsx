import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import userEvent from "@testing-library/user-event";
import BomberoForm from "../src/components/bomberos/BomberoForm";
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

describe("Componente BomberoForm", () => {
  it("renderiza el formulario correctamente", () => {
    renderWithProviders(<BomberoForm onSuccess={vi.fn()} onCancel={vi.fn()} />);
    
    expect(screen.getByLabelText(/nombres/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/apellidos/i)).toBeInTheDocument();
  });

  it("muestra el título 'Nuevo Bombero' cuando no hay bombero inicial", () => {
    renderWithProviders(<BomberoForm onSuccess={vi.fn()} onCancel={vi.fn()} />);
    
    expect(screen.getByText(/nuevo bombero/i)).toBeInTheDocument();
  });

  it("muestra el título 'Editar Bombero' cuando hay un bombero inicial", () => {
    const mockBombero = {
      id: 1,
      nombres: "Juan",
      apellidos: "Pérez",
      rut: "12345678-9",
    };

    renderWithProviders(
      <BomberoForm onSuccess={vi.fn()} onCancel={vi.fn()} bombero={mockBombero} />
    );
    
    expect(screen.getByText(/editar bombero/i)).toBeInTheDocument();
  });

  it("permite escribir en el campo de nombres", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BomberoForm onSuccess={vi.fn()} onCancel={vi.fn()} />);
    
    const nombresInput = screen.getByLabelText(/nombres/i);
    await user.type(nombresInput, "Carlos");
    
    expect(nombresInput).toHaveValue("Carlos");
  });

  it("permite escribir en el campo de apellidos", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BomberoForm onSuccess={vi.fn()} onCancel={vi.fn()} />);
    
    const apellidosInput = screen.getByLabelText(/apellidos/i);
    await user.type(apellidosInput, "González");
    
    expect(apellidosInput).toHaveValue("González");
  }, 10000);

  it("muestra validación cuando los campos requeridos están vacíos", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    renderWithProviders(<BomberoForm onSuccess={onSuccess} onCancel={vi.fn()} />);
    
    const guardarButton = screen.getByRole("button", { name: /guardar/i });
    await user.click(guardarButton);
    
    // El botón de guardar existe pero la validación debe prevenir el guardado
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("muestra botones de 'Cancelar' y 'Guardar'", () => {
    renderWithProviders(<BomberoForm onSuccess={vi.fn()} onCancel={vi.fn()} />);
    
    expect(screen.getByRole("button", { name: /guardar/i })).toBeInTheDocument();
    // El botón cancelar está como IconButton en el header
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(1);
  });

  it("llama a onCancel cuando se hace clic en el botón cerrar", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    
    renderWithProviders(<BomberoForm onSuccess={vi.fn()} onCancel={onCancel} />);
    
    // El botón de cancelar es el IconButton con CancelIcon en el header
    const cancelButtons = screen.getAllByRole("button");
    // El primer botón suele ser el de cerrar/cancelar
    await user.click(cancelButtons[0]);
    
    expect(onCancel).toHaveBeenCalled();
  });

  it("carga los datos del bombero cuando está en modo edición", () => {
    const mockBombero = {
      id: 1,
      nombres: "María",
      apellidos: "López Torres",
      rut: "98765432-1",
      email: "maria.lopez@bomberos.cl",
      telefono: "+56 9 8765 4321",
      rango: "Cabo",
      estado: "Activo",
    };

    renderWithProviders(
      <BomberoForm onSuccess={vi.fn()} onCancel={vi.fn()} bombero={mockBombero} />
    );
    
    expect(screen.getByDisplayValue("María")).toBeInTheDocument();
    expect(screen.getByDisplayValue("López Torres")).toBeInTheDocument();
  });

  it("tiene campos para email y teléfono", () => {
    renderWithProviders(<BomberoForm onSuccess={vi.fn()} onCancel={vi.fn()} />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
  });
});
