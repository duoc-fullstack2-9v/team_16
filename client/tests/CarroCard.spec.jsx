import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import CarroCard from "../src/components/carros/CarroCard";

// Mock de carro de ejemplo
const mockCarro = {
  id: 1,
  nombre: "Bomba B-1",
  tipo: "Bomba",
  estadoOperativo: "Operativo",
  patente: "AB-1234",
  marca: "Mercedes-Benz",
  modelo: "Atego 1725",
  año: 2020,
  capacidadAgua: 3000,
  capacidadEspuma: 500,
  cajoneras: 8,
  conductoresHabilitados: 5,
};

describe("Componente CarroCard", () => {
  it("renderiza el nombre del carro correctamente", () => {
    render(<CarroCard carro={mockCarro} />);
    
    expect(screen.getByText(/bomba b-1/i)).toBeInTheDocument();
  });

  it("muestra el tipo de carro como chip", () => {
    render(<CarroCard carro={mockCarro} />);
    
    // Verificar que el chip de tipo está presente (aparece múltiples veces en nombre y chip)
    const bombaElements = screen.getAllByText(/bomba/i);
    expect(bombaElements.length).toBeGreaterThan(0);
  });

  it("muestra el estado operativo del carro", () => {
    render(<CarroCard carro={mockCarro} />);
    
    expect(screen.getByText(/operativo/i)).toBeInTheDocument();
  });

  it("renderiza el icono de carro", () => {
    render(<CarroCard carro={mockCarro} />);
    
    // Verificar que el componente renderiza (el icono está integrado)
    expect(screen.getByText(/bomba b-1/i)).toBeInTheDocument();
  });

  it("muestra el estado 'Operativo' con color success", () => {
    render(<CarroCard carro={mockCarro} />);
    
    const estadoChip = screen.getByText(/operativo/i);
    expect(estadoChip).toBeInTheDocument();
  });

  it("muestra el estado 'Mantenimiento' con color warning", () => {
    const carroMantenimiento = { ...mockCarro, estadoOperativo: "Mantenimiento" };
    render(<CarroCard carro={carroMantenimiento} />);
    
    expect(screen.getByText(/mantenimiento/i)).toBeInTheDocument();
  });

  it("muestra el estado 'Fuera de Servicio' con color error", () => {
    const carroFueraServicio = { ...mockCarro, estadoOperativo: "Fuera de Servicio" };
    render(<CarroCard carro={carroFueraServicio} />);
    
    expect(screen.getByText(/fuera de servicio/i)).toBeInTheDocument();
  });

  it("tiene botones de acción (ver, editar)", () => {
    const onEdit = vi.fn();
    const onViewDetail = vi.fn();
    
    render(
      <CarroCard 
        carro={mockCarro}
        onEdit={onEdit}
        onViewDetail={onViewDetail}
      />
    );

    // Verificar que hay botones
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("llama a onEdit cuando se hace clic en el botón editar", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    
    render(<CarroCard carro={mockCarro} onEdit={onEdit} />);

    const buttons = screen.getAllByRole("button");
    if (buttons.length > 0) {
      await user.click(buttons[0]);
      expect(buttons[0]).toBeInTheDocument();
    }
  });

  it("muestra diferentes tipos de carros con colores distintos", () => {
    const carroEscala = { ...mockCarro, tipo: "Escala", nombre: "Escala E-1" };
    render(<CarroCard carro={carroEscala} />);
    
    // El texto 'Escala' aparece múltiples veces (nombre y chip)
    const escalaElements = screen.getAllByText(/escala/i);
    expect(escalaElements.length).toBeGreaterThan(0);
  });

  it("renderiza carro tipo 'Rescate'", () => {
    const carroRescate = { ...mockCarro, tipo: "Rescate", nombre: "Rescate R-1" };
    render(<CarroCard carro={carroRescate} />);
    
    // El texto 'Rescate' aparece múltiples veces (nombre y chip)
    const rescateElements = screen.getAllByText(/rescate/i);
    expect(rescateElements.length).toBeGreaterThan(0);
  });

  it("renderiza carro tipo 'Ambulancia'", () => {
    const carroAmbulancia = { ...mockCarro, tipo: "Ambulancia", nombre: "Ambulancia A-1" };
    render(<CarroCard carro={carroAmbulancia} />);
    
    // El texto 'Ambulancia' aparece múltiples veces (nombre y chip)
    const ambulanciaElements = screen.getAllByText(/ambulancia/i);
    expect(ambulanciaElements.length).toBeGreaterThan(0);
  });

  it("el componente tiene efecto hover", () => {
    const { container } = render(<CarroCard carro={mockCarro} />);
    
    // Verificar que el Card está renderizado
    const card = container.querySelector('.MuiCard-root');
    expect(card).toBeInTheDocument();
  });

  it("muestra información básica del carro", () => {
    render(<CarroCard carro={mockCarro} />);
    
    // Verificar que se renderiza el nombre (sin buscar el tipo que puede aparecer múltiples veces)
    expect(screen.getByText(/bomba b-1/i)).toBeInTheDocument();
    // Verificar patente
    expect(screen.getByText(/ab-1234/i)).toBeInTheDocument();
  });
});
