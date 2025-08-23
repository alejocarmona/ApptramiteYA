export type Field = {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'date';
  placeholder?: string;
  validation?: (value: string) => boolean;
  validationMessage?: string;
};

export type Tramite = {
  id: string;
  name: string;
  description: string;
  priceCop: number;
  flowType: 'API' | 'SCRAPE' | 'GUIDE';
  benefit: string;
  dataRequirements: Field[];
};

export const TRAMITES: Tramite[] = [
  {
    id: 'antecedentes-judiciales',
    name: 'Certificado de Antecedentes Judiciales',
    description:
      'Consulta y descarga el certificado de antecedentes de la Policía Nacional.',
    priceCop: 15000,
    flowType: 'GUIDE',
    benefit: 'Válido para cualquier trámite legal',
    dataRequirements: [
      {
        id: 'tipoDocumento',
        label: 'Tipo de Documento',
        type: 'text',
        placeholder: 'Cédula de Ciudadanía',
      },
      {
        id: 'numeroDocumento',
        label: 'Número de Documento',
        type: 'text',
        placeholder: '123456789',
      },
    ],
  },
  {
    id: 'afiliacion-eps',
    name: 'Certificado de Afiliación a EPS',
    description:
      'Obtén el certificado que acredita tu afiliación al sistema de salud.',
    priceCop: 12500,
    flowType: 'GUIDE',
    benefit: 'Recíbelo en tu correo en minutos',
    dataRequirements: [
      {
        id: 'tipoDocumento',
        label: 'Tipo de Documento',
        type: 'text',
        placeholder: 'Cédula de Ciudadanía',
      },
      {
        id: 'numeroDocumento',
        label: 'Número de Documento',
        type: 'text',
        placeholder: '123456789',
      },
    ],
  },
  {
    id: 'afiliacion-pensiones',
    name: 'Certificado de Afiliación a Pensiones',
    description:
      'Certificado de tu fondo de pensiones para trámites laborales y personales.',
    priceCop: 12500,
    flowType: 'GUIDE',
    benefit: 'Aceptado por todas las entidades',
    dataRequirements: [
      {
        id: 'tipoDocumento',
        label: 'Tipo de Documento',
        type: 'text',
        placeholder: 'Cédula de Ciudadanía',
      },
      {
        id: 'numeroDocumento',
        label: 'Número de Documento',
        type: 'text',
        placeholder: '123456789',
      },
    ],
  },
  {
    id: 'rut',
    name: 'RUT (Inscripción/Actualización/Descarga)',
    description: 'Gestiona tu Registro Único Tributario ante la DIAN.',
    priceCop: 25000,
    flowType: 'GUIDE',
    benefit: 'Actualizado y listo para imprimir',
    dataRequirements: [
      {
        id: 'tipoDocumento',
        label: 'Tipo de Documento',
        type: 'text',
        placeholder: 'Cédula de Ciudadanía',
      },
      {
        id: 'numeroDocumento',
        label: 'Número de Documento',
        type: 'text',
        placeholder: '123456789',
      },
      {
        id: 'fechaExpedicion',
        label: 'Fecha de Expedición del Documento',
        type: 'date',
      },
    ],
  },
  {
    id: 'camara-comercio',
    name: 'Certificado de Cámara de Comercio (RUES)',
    description:
      'Certificados de existencia y representación legal de empresas.',
    priceCop: 35000,
    flowType: 'GUIDE',
    benefit: 'Información oficial del RUES',
    dataRequirements: [
      {
        id: 'nit',
        label: 'NIT de la Empresa',
        type: 'text',
        placeholder: '900123456-7',
      },
    ],
  },
  {
    id: 'tradicion-libertad',
    name: 'Certificado de Tradición y Libertad',
    description: 'Documento que informa el historial jurídico de un inmueble.',
    priceCop: 45000,
    flowType: 'GUIDE',
    benefit: 'Directo de la Supernotariado',
    dataRequirements: [
      {
        id: 'matriculaInmobiliaria',
        label: 'Número de Matrícula Inmobiliaria',
        type: 'text',
        placeholder: '050-123456',
      },
      {
        id: 'ciudad',
        label: 'Ciudad de la Oficina de Registro',
        type: 'text',
        placeholder: 'Bogotá D.C.',
      },
    ],
  },
  {
    id: 'antecedentes-disciplinarios',
    name: 'Antecedentes Disciplinarios (Procuraduría)',
    description: 'Certificado sobre inhabilidades y sanciones disciplinarias.',
    priceCop: 15000,
    flowType: 'GUIDE',
    benefit: 'Consulta nacional al instante',
    dataRequirements: [
      {
        id: 'tipoDocumento',
        label: 'Tipo de Documento',
        type: 'text',
        placeholder: 'Cédula de Ciudadanía',
      },
      {
        id: 'numeroDocumento',
        label: 'Número de Documento',
        type: 'text',
        placeholder: '123456789',
      },
    ],
  },
  {
    id: 'antecedentes-fiscales',
    name: 'Antecedentes Fiscales (Contraloría)',
    description:
      'Certificado de responsabilidad fiscal emitido por la Contraloría.',
    priceCop: 15000,
    flowType: 'GUIDE',
    benefit: 'Certificado oficial para contratos',
    dataRequirements: [
      {
        id: 'tipoDocumento',
        label: 'Tipo de Documento',
        type: 'text',
        placeholder: 'Cédula de Ciudadanía',
      },
      {
        id: 'numeroDocumento',
        label: 'Número de Documento',
        type: 'text',
        placeholder: '123456789',
      },
    ],
  },
];
