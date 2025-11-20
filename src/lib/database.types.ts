export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alimentos: {
        Row: {
          created_at: string | null
          id: string
          nombre: string
          tipo_mascota: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nombre: string
          tipo_mascota?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nombre?: string
          tipo_mascota?: string | null
        }
        Relationships: []
      }
      cat_cp: {
        Row: {
          colonia: string
          cp: number
          idcp: number
          idestado: number
          idmunicipio: number
        }
        Insert: {
          colonia: string
          cp: number
          idcp?: number
          idestado: number
          idmunicipio: number
        }
        Update: {
          colonia?: string
          cp?: number
          idcp?: number
          idestado?: number
          idmunicipio?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_cat_cp_cat_estados1"
            columns: ["idestado"]
            isOneToOne: false
            referencedRelation: "cat_estados"
            referencedColumns: ["idestado"]
          },
          {
            foreignKeyName: "fk_cat_cp_cat_municipios1"
            columns: ["idmunicipio", "idestado"]
            isOneToOne: false
            referencedRelation: "cat_municipios"
            referencedColumns: ["idmunicipio", "idestado"]
          },
        ]
      }
      cat_estados: {
        Row: {
          estado: string
          idestado: number
        }
        Insert: {
          estado: string
          idestado: number
        }
        Update: {
          estado?: string
          idestado?: number
        }
        Relationships: []
      }
      cat_municipios: {
        Row: {
          idestado: number
          idmunicipio: number
          municipio: string
        }
        Insert: {
          idestado: number
          idmunicipio: number
          municipio: string
        }
        Update: {
          idestado?: number
          idmunicipio?: number
          municipio?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_cat_municipios_cat_estados1"
            columns: ["idestado"]
            isOneToOne: false
            referencedRelation: "cat_estados"
            referencedColumns: ["idestado"]
          },
        ]
      }
      clientes: {
        Row: {
          calle_numero: string | null
          codigo_postal: string | null
          colonia: string | null
          consentimiento_datos: boolean | null
          created_at: string | null
          email: string
          estado: string | null
          fecha_registro: string | null
          id: string
          id_ubicacion: string | null
          municipio: string | null
          nombre: string
          telefono: string | null
        }
        Insert: {
          calle_numero?: string | null
          codigo_postal?: string | null
          colonia?: string | null
          consentimiento_datos?: boolean | null
          created_at?: string | null
          email: string
          estado?: string | null
          fecha_registro?: string | null
          id?: string
          id_ubicacion?: string | null
          municipio?: string | null
          nombre: string
          telefono?: string | null
        }
        Update: {
          calle_numero?: string | null
          codigo_postal?: string | null
          colonia?: string | null
          consentimiento_datos?: boolean | null
          created_at?: string | null
          email?: string
          estado?: string | null
          fecha_registro?: string | null
          id?: string
          id_ubicacion?: string | null
          municipio?: string | null
          nombre?: string
          telefono?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_id_ubicacion_fkey"
            columns: ["id_ubicacion"]
            isOneToOne: false
            referencedRelation: "ubicaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      contratos: {
        Row: {
          created_at: string | null
          estado_firma: string | null
          fecha_firma: string | null
          hash_documento: string | null
          id: string
          id_reserva: string | null
          url_documento: string | null
        }
        Insert: {
          created_at?: string | null
          estado_firma?: string | null
          fecha_firma?: string | null
          hash_documento?: string | null
          id?: string
          id_reserva?: string | null
          url_documento?: string | null
        }
        Update: {
          created_at?: string | null
          estado_firma?: string | null
          fecha_firma?: string | null
          hash_documento?: string | null
          id?: string
          id_reserva?: string | null
          url_documento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_id_reserva_fkey"
            columns: ["id_reserva"]
            isOneToOne: false
            referencedRelation: "reservas"
            referencedColumns: ["id"]
          },
        ]
      }
      estados: {
        Row: {
          id: number
          id_pais: number | null
          nombre: string
        }
        Insert: {
          id?: number
          id_pais?: number | null
          nombre: string
        }
        Update: {
          id?: number
          id_pais?: number | null
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "estados_id_pais_fkey"
            columns: ["id_pais"]
            isOneToOne: false
            referencedRelation: "paises"
            referencedColumns: ["id"]
          },
        ]
      }
      localidades: {
        Row: {
          id: number
          id_municipio: number | null
          nombre: string
        }
        Insert: {
          id?: number
          id_municipio?: number | null
          nombre: string
        }
        Update: {
          id?: number
          id_municipio?: number | null
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "localidades_id_municipio_fkey"
            columns: ["id_municipio"]
            isOneToOne: false
            referencedRelation: "municipios"
            referencedColumns: ["id"]
          },
        ]
      }
      mascotas: {
        Row: {
          codigo_unico: string
          created_at: string | null
          edad: number | null
          especie: string
          fecha_de_nacimiento: string | null
          fecha_ultima_vacuna: string | null
          genero: string | null
          historial_medico: string | null
          id: string
          id_cliente: string | null
          nombre: string
          peso: number | null
          raza: string | null
          url_foto: string | null
          // Estado de actividad y esterilización
          activo: boolean | null
          esterilizado: boolean | null
          motivo_inactivo: string | null
          // Campos agregados para protocolos y cuidados especiales
          cuidados_especiales: boolean | null
          protocolo_medicamentos: string | null
          protocolo_dietas_especiales: string | null
          protocolo_cuidado_geriatrico: string | null
          // Opcionales de protocolo de alimentación guardados en mascota
          id_alimento: string | null
          alimento_cantidad: string | null
          alimento_frecuencia: string | null
          alimento_horarios: string | null
        }
        Insert: {
          codigo_unico?: string
          created_at?: string | null
          edad?: number | null
          especie: string
          fecha_de_nacimiento?: string | null
          fecha_ultima_vacuna?: string | null
          genero?: string | null
          historial_medico?: string | null
          id?: string
          id_cliente?: string | null
          nombre: string
          peso?: number | null
          raza?: string | null
          url_foto?: string | null
          activo?: boolean | null
          esterilizado?: boolean | null
          motivo_inactivo?: string | null
          cuidados_especiales?: boolean | null
          protocolo_medicamentos?: string | null
          protocolo_dietas_especiales?: string | null
          protocolo_cuidado_geriatrico?: string | null
          id_alimento?: string | null
          alimento_cantidad?: string | null
          alimento_frecuencia?: string | null
          alimento_horarios?: string | null
        }
        Update: {
          codigo_unico?: string
          created_at?: string | null
          edad?: number | null
          especie?: string
          fecha_de_nacimiento?: string | null
          fecha_ultima_vacuna?: string | null
          genero?: string | null
          historial_medico?: string | null
          id?: string
          id_cliente?: string | null
          nombre?: string
          peso?: number | null
          raza?: string | null
          url_foto?: string | null
          activo?: boolean | null
          esterilizado?: boolean | null
          motivo_inactivo?: string | null
          cuidados_especiales?: boolean | null
          protocolo_medicamentos?: string | null
          protocolo_dietas_especiales?: string | null
          protocolo_cuidado_geriatrico?: string | null
          id_alimento?: string | null
          alimento_cantidad?: string | null
          alimento_frecuencia?: string | null
          alimento_horarios?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mascotas_id_cliente_fkey"
            columns: ["id_cliente"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      municipios: {
        Row: {
          id: number
          id_estado: number | null
          nombre: string
        }
        Insert: {
          id?: number
          id_estado?: number | null
          nombre: string
        }
        Update: {
          id?: number
          id_estado?: number | null
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "municipios_id_estado_fkey"
            columns: ["id_estado"]
            isOneToOne: false
            referencedRelation: "estados"
            referencedColumns: ["id"]
          },
        ]
      }
      paises: {
        Row: {
          id: number
          nombre: string
        }
        Insert: {
          id?: number
          nombre: string
        }
        Update: {
          id?: number
          nombre?: string
        }
        Relationships: []
      }
      personal: {
        Row: {
          activo: boolean | null
          created_at: string | null
          email: string
          id: string
          id_ubicacion: string | null
          nombre: string
          rol: string
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          email: string
          id?: string
          id_ubicacion?: string | null
          nombre: string
          rol: string
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          email?: string
          id?: string
          id_ubicacion?: string | null
          nombre?: string
          rol?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_id_ubicacion_fkey"
            columns: ["id_ubicacion"]
            isOneToOne: false
            referencedRelation: "ubicaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      reserva_servicios_extra: {
        Row: {
          cantidad: number | null
          id: string
          id_reserva: string | null
          id_servicio_extra: string | null
          precio_cobrado: number
        }
        Insert: {
          cantidad?: number | null
          id?: string
          id_reserva?: string | null
          id_servicio_extra?: string | null
          precio_cobrado: number
        }
        Update: {
          cantidad?: number | null
          id?: string
          id_reserva?: string | null
          id_servicio_extra?: string | null
          precio_cobrado?: number
        }
        Relationships: [
          {
            foreignKeyName: "reserva_servicios_extra_id_reserva_fkey"
            columns: ["id_reserva"]
            isOneToOne: false
            referencedRelation: "reservas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reserva_servicios_extra_id_servicio_extra_fkey"
            columns: ["id_servicio_extra"]
            isOneToOne: false
            referencedRelation: "servicios_extra"
            referencedColumns: ["id"]
          },
        ]
      }
      reservas: {
        Row: {
          alimento_cantidad: string | null
          alimento_frecuencia: string | null
          alimento_horarios: string | null
          costo_iva: number | null
          costo_total: number
          created_at: string | null
          estado: string | null
          fecha_fin: string
          fecha_inicio: string
          id: string
          id_alimento: string | null
          id_cliente: string | null
          id_mascota: string | null
          id_servicio: string | null
          id_ubicacion: string | null
          metodo_pago_anticipo: string | null
          monto_anticipo: number | null
          monto_restante: number | null
          notas: string | null
          pertenencias: Json | null
          solicita_factura: boolean | null
        }
        Insert: {
          alimento_cantidad?: string | null
          alimento_frecuencia?: string | null
          alimento_horarios?: string | null
          costo_iva?: number | null
          costo_total?: number
          created_at?: string | null
          estado?: string | null
          fecha_fin: string
          fecha_inicio: string
          id?: string
          id_alimento?: string | null
          id_cliente?: string | null
          id_mascota?: string | null
          id_servicio?: string | null
          id_ubicacion?: string | null
          metodo_pago_anticipo?: string | null
          monto_anticipo?: number | null
          monto_restante?: number | null
          notas?: string | null
          pertenencias?: Json | null
          solicita_factura?: boolean | null
        }
        Update: {
          alimento_cantidad?: string | null
          alimento_frecuencia?: string | null
          alimento_horarios?: string | null
          costo_iva?: number | null
          costo_total?: number
          created_at?: string | null
          estado?: string | null
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          id_alimento?: string | null
          id_cliente?: string | null
          id_mascota?: string | null
          id_servicio?: string | null
          id_ubicacion?: string | null
          metodo_pago_anticipo?: string | null
          monto_anticipo?: number | null
          monto_restante?: number | null
          notas?: string | null
          pertenencias?: Json | null
          solicita_factura?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "reservas_id_alimento_fkey"
            columns: ["id_alimento"]
            isOneToOne: false
            referencedRelation: "alimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_id_cliente_fkey"
            columns: ["id_cliente"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_id_mascota_fkey"
            columns: ["id_mascota"]
            isOneToOne: false
            referencedRelation: "mascotas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_id_servicio_fkey"
            columns: ["id_servicio"]
            isOneToOne: false
            referencedRelation: "servicios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_id_ubicacion_fkey"
            columns: ["id_ubicacion"]
            isOneToOne: false
            referencedRelation: "ubicaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      servicios: {
        Row: {
          activo: boolean | null
          created_at: string | null
          descripcion: string | null
          duracion_estimada: number | null
          id: string
          nombre: string
          precio_base: number
          tipo_servicio: string | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          duracion_estimada?: number | null
          id?: string
          nombre: string
          precio_base?: number
          tipo_servicio?: string | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          duracion_estimada?: number | null
          id?: string
          nombre?: string
          precio_base?: number
          tipo_servicio?: string | null
        }
        Relationships: []
      }
      servicios_extra: {
        Row: {
          activo: boolean | null
          created_at: string | null
          id: string
          nombre: string
          precio: number
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          id?: string
          nombre: string
          precio?: number
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          id?: string
          nombre?: string
          precio?: number
        }
        Relationships: []
      }
      tarifas_peso: {
        Row: {
          created_at: string | null
          id: string
          peso_max: number
          peso_min: number
          tarifa_guarderia: number
          tarifa_noche: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          peso_max: number
          peso_min: number
          tarifa_guarderia?: number
          tarifa_noche?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          peso_max?: number
          peso_min?: number
          tarifa_guarderia?: number
          tarifa_noche?: number
        }
        Relationships: []
      }
      transacciones_financieras: {
        Row: {
          categoria: string | null
          created_at: string | null
          descripcion: string | null
          fecha: string | null
          id: string
          id_reserva: string | null
          id_ubicacion: string | null
          metodo_pago: string | null
          monto: number
          tipo: string
        }
        Insert: {
          categoria?: string | null
          created_at?: string | null
          descripcion?: string | null
          fecha?: string | null
          id?: string
          id_reserva?: string | null
          id_ubicacion?: string | null
          metodo_pago?: string | null
          monto: number
          tipo: string
        }
        Update: {
          categoria?: string | null
          created_at?: string | null
          descripcion?: string | null
          fecha?: string | null
          id?: string
          id_reserva?: string | null
          id_ubicacion?: string | null
          metodo_pago?: string | null
          monto?: number
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "transacciones_financieras_id_reserva_fkey"
            columns: ["id_reserva"]
            isOneToOne: false
            referencedRelation: "reservas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_financieras_id_ubicacion_fkey"
            columns: ["id_ubicacion"]
            isOneToOne: false
            referencedRelation: "ubicaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      ubicaciones: {
        Row: {
          capacidad_total: number
          created_at: string | null
          direccion: string
          id: string
          nombre: string
        }
        Insert: {
          capacidad_total?: number
          created_at?: string | null
          direccion: string
          id?: string
          nombre: string
        }
        Update: {
          capacidad_total?: number
          created_at?: string | null
          direccion?: string
          id?: string
          nombre?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
