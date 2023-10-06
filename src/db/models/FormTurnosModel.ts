import { modelOptions, prop, getModelForClass } from "@typegoose/typegoose";

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
})
export class FormTurnos {
  @prop()
  nombreCompleto: string;

  @prop()
  telefono: string;

  @prop()
  horarioPreferido: string;

  @prop()
  obraSocial: string;

  @prop({ default: true })
  otroEspecialista: boolean;

  @prop()
  fechaNacimiento: string;

  @prop({ enum: ["presencial", "videoconferencia", "cualquiera"] })
  tipoConsulta: string;

  @prop()
  provincia: string;

  @prop()
  localidad: string;

  @prop()
  dni: string;

  @prop()
  comentario: string;
}

export const FormTurnosModel = getModelForClass(FormTurnos);
