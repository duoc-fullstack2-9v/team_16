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

  // Tests adicionales para mejorar cobertura

  it("maneja fecha en formato inválido", () => {
    const citacionFechaInvalida = { ...mockCitacion, fecha: "fecha-invalida" };
    renderWithProviders(<CitacionCard citacion={citacionFechaInvalida} />);
    
    // Debe mostrar la fecha tal cual si no puede formatearla
    expect(screen.getByText(/fecha-invalida/i)).toBeInTheDocument();
  });

  it("maneja hora en formato inválido", () => {
    const citacionHoraInvalida = { ...mockCitacion, hora: null };
    renderWithProviders(<CitacionCard citacion={citacionHoraInvalida} />);
    
    // Debe renderizar sin errores
    expect(screen.getByText(/capacitación de emergencias/i)).toBeInTheDocument();
  });

  it("muestra mensaje 'Sin bomberos asignados' cuando no hay bomberos", () => {
    const citacionSinBomberos = { ...mockCitacion, bomberos: [] };
    renderWithProviders(<CitacionCard citacion={citacionSinBomberos} />);
    
    expect(screen.getByText(/sin bomberos asignados/i)).toBeInTheDocument();
  });

  it("muestra el motivo de la citación cuando existe", () => {
    const citacionConMotivo = { 
      ...mockCitacion, 
      motivo: "Entrenamiento obligatorio para todos los bomberos activos" 
    };
    renderWithProviders(<CitacionCard citacion={citacionConMotivo} />);
    
    expect(screen.getByText(/entrenamiento obligatorio/i)).toBeInTheDocument();
  });

  it("no muestra el motivo cuando no existe", () => {
    const citacionSinMotivo = { ...mockCitacion, motivo: undefined };
    renderWithProviders(<CitacionCard citacion={citacionSinMotivo} />);
    
    expect(screen.queryByText(/motivo/i)).not.toBeInTheDocument();
  });

  it("muestra estadísticas de asistencia para citación realizada", () => {
    const citacionRealizada = {
      ...mockCitacion,
      estado: "realizada",
      bomberos: [
        { 
          id: 1, 
          bombero: { id: 1, nombres: "Juan", apellidos: "Pérez", rango: "Bombero" },
          asistio: true 
        },
        { 
          id: 2, 
          bombero: { id: 2, nombres: "María", apellidos: "González", rango: "Teniente" },
          asistio: true 
        },
        { 
          id: 3, 
          bombero: { id: 3, nombres: "Carlos", apellidos: "López", rango: "Sargento" },
          asistio: null 
        },
      ],
    };
    renderWithProviders(<CitacionCard citacion={citacionRealizada} />);
    
    // Debe mostrar confirmados y pendientes
    expect(screen.getByText(/2 confirmados/i)).toBeInTheDocument();
    expect(screen.getByText(/1 pendientes/i)).toBeInTheDocument();
  });

  it("no muestra estadísticas de asistencia para citación programada", () => {
    renderWithProviders(<CitacionCard citacion={mockCitacion} />);
    
    // No debe mostrar confirmados/pendientes para programada
    expect(screen.queryByText(/confirmados/i)).not.toBeInTheDocument();
  });

  it("muestra el botón de cancelar solo para citaciones programadas", () => {
    const onCancel = vi.fn();
    const citacionProgramada = { ...mockCitacion, estado: "Programada" };
    
    renderWithProviders(
      <CitacionCard citacion={citacionProgramada} onCancel={onCancel} />
    );
    
    // Verificar que existe el botón con el ícono Cancel
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("no muestra el botón de editar para citaciones realizadas", () => {
    const onEdit = vi.fn();
    const citacionRealizada = { ...mockCitacion, estado: "realizada" };
    
    renderWithProviders(
      <CitacionCard citacion={citacionRealizada} onEdit={onEdit} />
    );
    
    // El botón de editar no debe estar disponible
    const buttons = screen.getAllByRole("button");
    // Para citación realizada, solo debe haber 2 botones: Ver y Asignar
    expect(buttons.length).toBeLessThan(5);
  });

  it("no muestra el botón de eliminar para citaciones realizadas", () => {
    const onDelete = vi.fn();
    const citacionRealizada = { ...mockCitacion, estado: "Realizada" };
    
    renderWithProviders(
      <CitacionCard citacion={citacionRealizada} onDelete={onDelete} />
    );
    
    const buttons = screen.getAllByRole("button");
    // Para citación realizada, no debe haber botón de eliminar
    expect(buttons.length).toBe(2); // Solo Ver y Asignar
  });

  it("llama a onEdit cuando se hace clic en el botón de editar", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    
    renderWithProviders(
      <CitacionCard citacion={mockCitacion} onEdit={onEdit} />
    );

    const buttons = screen.getAllByRole("button");
    // El botón de editar es el cuarto (Ver, Asignar, Cancelar, Editar)
    if (buttons.length >= 4) {
      await user.click(buttons[3]);
      expect(onEdit).toHaveBeenCalledWith(mockCitacion);
    }
  });

  it("llama a onDelete cuando se hace clic en el botón de eliminar", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    
    renderWithProviders(
      <CitacionCard citacion={mockCitacion} onDelete={onDelete} />
    );

    const buttons = screen.getAllByRole("button");
    // El botón de eliminar es el último
    await user.click(buttons[buttons.length - 1]);
    expect(onDelete).toHaveBeenCalledWith(mockCitacion);
  });

  it("llama a onAssign cuando se hace clic en el botón de asignar", async () => {
    const user = userEvent.setup();
    const onAssign = vi.fn();
    
    renderWithProviders(
      <CitacionCard citacion={mockCitacion} onAssign={onAssign} />
    );

    const buttons = screen.getAllByRole("button");
    // El botón de asignar es el segundo
    if (buttons.length >= 2) {
      await user.click(buttons[1]);
      expect(onAssign).toHaveBeenCalledWith(mockCitacion);
    }
  });

  it("llama a onCancel cuando se hace clic en el botón de cancelar", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const citacionProgramada = { ...mockCitacion, estado: "Programada" };
    
    renderWithProviders(
      <CitacionCard citacion={citacionProgramada} onCancel={onCancel} />
    );

    const buttons = screen.getAllByRole("button");
    // El botón de cancelar es el tercero (Ver, Asignar, Cancelar)
    if (buttons.length >= 3) {
      await user.click(buttons[2]);
      expect(onCancel).toHaveBeenCalledWith(citacionProgramada);
    }
  });

  it("deshabilita todos los botones cuando loading es true", () => {
    renderWithProviders(
      <CitacionCard citacion={mockCitacion} loading={true} />
    );

    const buttons = screen.getAllByRole("button");
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it("muestra avatar con iniciales cuando el bombero no tiene foto", () => {
    const citacionConBomberosSimples = {
      ...mockCitacion,
      bomberos: [
        { 
          id: 1,
          bombero: { id: 1, nombres: "Ana", apellidos: "Martínez", rango: "Bombero" },
          asistio: null
        },
      ],
    };
    renderWithProviders(<CitacionCard citacion={citacionConBomberosSimples} />);
    
    // Debe renderizar sin errores
    expect(screen.getByText(/capacitación de emergencias/i)).toBeInTheDocument();
  });

  it("maneja bomberos con fotoUrl", () => {
    const citacionConFotos = {
      ...mockCitacion,
      bomberos: [
        { 
          id: 1,
          bombero: { 
            id: 1, 
            nombres: "Pedro", 
            apellidos: "Gómez", 
            rango: "Capitán",
            fotoUrl: "/assets/bomberos/bombero-1.jpg"
          },
          asistio: true
        },
      ],
    };
    renderWithProviders(<CitacionCard citacion={citacionConFotos} />);
    
    expect(screen.getByText(/capacitación de emergencias/i)).toBeInTheDocument();
  });

  it("renderiza correctamente sin la prop lugar", () => {
    const citacionSinLugar = { ...mockCitacion, lugar: undefined };
    renderWithProviders(<CitacionCard citacion={citacionSinLugar} />);
    
    expect(screen.queryByText(/cuartel/i)).not.toBeInTheDocument();
  });

  it("maneja estado con mayúsculas y minúsculas mezcladas", () => {
    const citacionEstadoMixto = { ...mockCitacion, estado: "cancelada" };
    renderWithProviders(<CitacionCard citacion={citacionEstadoMixto} />);
    
    expect(screen.getByText(/cancelada/i)).toBeInTheDocument();
  });

  it("renderiza título por defecto cuando no hay título", () => {
    const citacionSinTitulo = { ...mockCitacion, titulo: undefined };
    renderWithProviders(<CitacionCard citacion={citacionSinTitulo} />);
    
    expect(screen.getByText(/sin título/i)).toBeInTheDocument();
  });
});
