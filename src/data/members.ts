import { subDays } from 'date-fns'
import type { Bi } from '@/lib/i18n'
import { HOBBIES, PORQUE, PROFESIONES, SONGS } from './catalog'
import type {
  Educacion,
  EstiloVida,
  Fe,
  Genero,
  Hijos,
  Intencion,
  Member,
  MemberStatus,
  Pago,
  Politica,
  Practica,
  Psicologa,
} from './types'

export const PSICOLOGAS: Psicologa[] = [
  { id: 'p1', nombre: 'Lic. Carolina Méndez', color: '#9F1D48', email: 'carolina@yomequierocasar.demo' },
  { id: 'p2', nombre: 'Lic. Paula Iturralde', color: '#2563eb', email: 'paula@yomequierocasar.demo' },
  { id: 'p3', nombre: 'Lic. Andrea Giménez', color: '#0d9488', email: 'andrea@yomequierocasar.demo' },
]
export const psicoById = (id: string) => PSICOLOGAS.find((p) => p.id === id) ?? PSICOLOGAS[0]

export const TODAY = new Date()

// id, nombre, apellido, genero, edad, ciudad, profesion, educacion, fe, practica, intencion, hijos,
// valores, hobbies, estilo, politica, estado, pago, psicologa, diasAlta, completitud, nFotos,
// canciones, cuestionario (10 dígitos 1-5), etiquetas psico, rechazados
type Row = [
  string, string, string, Genero, number, string, string, Educacion, Fe, Practica, Intencion, Hijos,
  string, string, EstiloVida, Politica | '', MemberStatus, Pago, string, number, number, number,
  string, string, string, string,
]

const ROWS: Row[] = [
  // ——— Hombres ———
  ['h01', 'Martín', 'Aguirre', 'M', 36, 'Palermo', 'arquitecto', 'posgrado', 'catolica', 'mensual', '1-2a', 'quiere', 'familia,honestidad,humor,compromiso', 'fotografia,viajes,cocina,bici', 'activo', 'centro', 'pendiente', 'ok', 'p1', 12, 92, 3, 's1,s4,s11', '4443454344', '', ''],
  ['h02', 'Javier', 'Ríos', 'M', 38, 'Belgrano', 'abogado', 'posgrado', 'catolica', 'semanal', '<1a', 'quiere', 'familia,fe,lealtad,compromiso', 'trekking,lectura,vino,cocina', 'tranquilo', 'centro-derecha', 'aprobado', 'ok', 'p1', 64, 100, 4, 's17,s7,s13', '4454354454', 'familia,madurez', 'f05'],
  ['h03', 'Federico', 'Olmos', 'M', 41, 'Núñez', 'medico', 'posgrado', 'judia', 'mensual', '1-2a', 'quiere', 'familia,tradicion,trabajo,respeto', 'tenis,lectura,vino,viajes', 'tranquilo', 'centro', 'aprobado', 'ok', 'p2', 88, 100, 3, 's26,s29,s15', '3454444354', 'mismaFe', ''],
  ['h04', 'Nicolás', 'Herrera', 'M', 33, 'Caballito', 'ingeniero', 'universitario', 'catolica', 'ocasional', '1-2a', 'quiere', 'familia,humor,trabajo', 'futbol,running,cine', 'activo', 'centro', 'pendiente', 'ok', 'p2', 6, 85, 2, 's5,s24', '4343434434', '', ''],
  ['h05', 'Santiago', 'Bustos', 'M', 45, 'San Isidro', 'bancario', 'universitario', 'catolica', 'semanal', '<1a', 'tiene y quiere más', 'familia,fe,tradicion,compromiso', 'tenis,vino,jardineria', 'hogareno', 'centro-derecha', 'aprobado', 'ok', 'p1', 140, 100, 4, 's19,s17', '4354354553', 'familia', ''],
  ['h06', 'Diego', 'Maldonado', 'M', 39, 'Rosario', 'contador', 'universitario', 'evangelica', 'semanal', '<1a', 'quiere', 'fe,familia,honestidad,generosidad', 'musica,cocina,voluntariado', 'hogareno', 'centro', 'aprobado', 'ok', 'p3', 102, 96, 3, 's9,s10', '5455355454', 'mismaFe,familia', ''],
  ['h07', 'Pablo', 'Quiroga', 'M', 50, 'Mendoza', 'productor', 'terciario', 'catolica', 'mensual', '1-2a', 'tiene, no quiere más', 'familia,trabajo,lealtad', 'vino,trekking,cocina', 'tranquilo', 'centro-derecha', 'aprobado', 'ok', 'p3', 160, 94, 3, 's7,s8', '3443443443', 'madurez', ''],
  ['h08', 'Andrés', 'Villalba', 'M', 34, 'Palermo', 'disenador', 'universitario', 'espiritual', 'no practica', '2-3a', 'quiere', 'libertad,humor,honestidad,solidaridad', 'musica,bici,fotografia,cine', 'social', 'centro-izquierda', 'aprobado', 'ok', 'p2', 75, 98, 4, 's2,s21,s28', '4334242434', 'comunicacion', ''],
  ['h09', 'Tomás', 'Echeverría', 'M', 37, 'Recoleta', 'economista', 'posgrado', 'catolica', 'ocasional', '1-2a', 'quiere', 'familia,honestidad,trabajo,humor', 'running,viajes,lectura,vino', 'activo', 'centro', 'aprobado', 'ok', 'p1', 51, 100, 4, 's11,s32,s25', '4343454344', 'comunicacion', ''],
  ['h10', 'Gonzalo', 'Paredes', 'M', 42, 'Córdoba', 'odontologo', 'universitario', 'catolica', 'mensual', '1-2a', 'tiene y quiere más', 'familia,respeto,humor', 'futbol,cocina,trekking', 'social', 'centro', 'aprobado', 'ok', 'p3', 120, 97, 3, 's4,s31', '4434344444', '', ''],
  ['h11', 'Matías', 'Correa', 'M', 31, 'Vicente López', 'analista', 'universitario', 'agnostica', 'no practica', '2-3a', 'quiere', 'honestidad,libertad,humor', 'musica,cine,running,viajes', 'social', 'centro-izquierda', 'aprobado', 'ok', 'p2', 40, 95, 3, 's12,s5', '4334343424', '', ''],
  ['h12', 'Esteban', 'Ruiz', 'M', 47, 'La Plata', 'docente_m', 'universitario', 'catolica', 'semanal', '1-2a', 'tiene, no quiere más', 'fe,familia,tradicion', 'lectura,jardineria,teatro', 'hogareno', 'centro-derecha', 'pausa', 'ok', 'p1', 200, 100, 2, 's20', '3453354453', '', ''],
  ['h13', 'Ignacio', 'Salvatierra', 'M', 35, 'Belgrano', 'medico', 'posgrado', 'catolica', 'semanal', '<1a', 'quiere', 'familia,fe,compromiso,generosidad', 'running,cocina,viajes', 'activo', 'centro-derecha', 'aprobado', 'ok', 'p1', 33, 100, 4, 's17,s13,s24', '4454354444', 'familia', ''],
  ['h14', 'Leandro', 'Funes', 'M', 40, 'Caballito', 'kinesiologo', 'universitario', 'cristiana', 'mensual', '1-2a', 'quiere', 'familia,respeto,trabajo', 'futbol,tenis,cine', 'activo', 'centro', 'aprobado', 'ok', 'p2', 95, 93, 3, 's27,s4', '4344344444', '', ''],
  ['h15', 'Hernán', 'Cabrera', 'M', 44, 'San Isidro', 'comerciante', 'secundario', 'catolica', 'ocasional', '1-2a', 'tiene, no quiere más', 'familia,trabajo,lealtad', 'futbol,vino,cocina', 'social', 'centro-derecha', 'pendiente', 'ok', 'p3', 9, 80, 2, 's19', '3433343343', '', ''],
  ['h16', 'Lucas', 'Domínguez', 'M', 29, 'Palermo', 'chef', 'terciario', 'espiritual', 'no practica', '2-3a', 'quiere', 'humor,libertad', 'cocina,musica,viajes', 'social', '', 'incompleto', 'pendiente', 'p1', 3, 45, 1, 's31', '4334', '', ''],
  ['h17', 'Marcos', 'Ibarra', 'M', 52, 'Núñez', 'ingeniero', 'posgrado', 'judia', 'ocasional', '1-2a', 'tiene, no quiere más', 'familia,trabajo,honestidad', 'lectura,tenis,viajes', 'tranquilo', 'centro', 'aprobado', 'ok', 'p2', 180, 99, 3, 's30,s29,s15', '3443443453', 'madurez', ''],
  ['h18', 'Rodrigo', 'Peralta', 'M', 43, 'Rosario', 'comerciante', 'secundario', 'agnostica', 'no practica', '2-3a', 'no quiere', 'libertad', 'futbol,cine', 'social', 'apolitico', 'rechazado', 'reembolsado', 'p3', 70, 88, 2, 's5', '2324232323', 'ansiedad', ''],
  ['h19', 'Sebastián', 'Luna', 'M', 38, 'Recoleta', 'periodista', 'universitario', 'catolica', 'mensual', '1-2a', 'quiere', 'familia,honestidad,humor,solidaridad', 'lectura,musica,teatro,cine', 'tranquilo', 'centro-izquierda', 'aprobado', 'ok', 'p1', 58, 100, 4, 's1,s3,s20', '4443444344', 'comunicacion', ''],
  ['h20', 'Joaquín', 'Arce', 'M', 32, 'Vicente López', 'contador', 'universitario', 'catolica', 'semanal', '<1a', 'quiere', 'familia,fe,compromiso', 'running,cocina,voluntariado', 'activo', 'centro-derecha', 'pendiente', 'ok', 'p2', 5, 88, 3, 's24,s17', '4454354454', '', ''],
  ['h21', 'Emiliano', 'Toledo', 'M', 46, 'Mendoza', 'medico', 'posgrado', 'catolica', 'ocasional', '1-2a', 'tiene y quiere más', 'familia,generosidad,trabajo', 'trekking,vino,bici', 'activo', 'centro', 'aprobado', 'ok', 'p3', 130, 96, 3, 's7,s26', '4443444444', '', ''],
  ['h22', 'Gustavo', 'Rinaldi', 'M', 55, 'La Plata', 'bancario', 'universitario', 'catolica', 'ocasional', '2-3a', 'no quiere', 'trabajo,libertad', 'futbol,vino', 'social', 'centro-derecha', 'rechazado', 'reembolsado', 'p1', 90, 90, 2, 's19', '2323233232', 'ansiedad', ''],
  ['h23', 'Alejandro', 'Vidal', 'M', 39, 'Palermo', 'musico', 'terciario', 'espiritual', 'no practica', '1-2a', 'quiere', 'familia,humor,libertad,honestidad', 'musica,yoga,viajes,cocina', 'social', 'centro-izquierda', 'aprobado', 'ok', 'p2', 44, 98, 4, 's1,s12,s16', '5434353434', 'comunicacion', ''],
  ['h24', 'Cristian', 'Medina', 'M', 30, 'Córdoba', 'analista', 'universitario', 'catolica', 'ocasional', '2-3a', 'quiere', 'humor', 'futbol', 'social', '', 'incompleto', 'fallido', 'p3', 2, 30, 0, '', '43', '', ''],
  // ——— Mujeres ———
  ['f01', 'Sofía', 'Ledesma', 'F', 33, 'Caballito', 'nutricionista', 'universitario', 'catolica', 'mensual', '1-2a', 'quiere', 'familia,honestidad,generosidad', 'yoga,cocina,lectura', 'tranquilo', 'centro', 'pendiente', 'ok', 'p1', 9, 90, 3, 's13,s16', '4443354444', '', ''],
  ['f02', 'Valentina', 'Ferreyra', 'F', 34, 'Palermo', 'disenadora', 'universitario', 'catolica', 'ocasional', '1-2a', 'quiere', 'familia,honestidad,humor,generosidad', 'fotografia,viajes,cine,cocina', 'social', 'centro-izquierda', 'aprobado', 'ok', 'p1', 47, 100, 4, 's2,s12,s9', '3443444354', 'familia,comunicacion', ''],
  ['f03', 'Lucía', 'Paz', 'F', 32, 'Núñez', 'medica', 'posgrado', 'catolica', 'mensual', '<1a', 'quiere', 'familia,fe,lealtad,compromiso', 'trekking,lectura,cocina,vino', 'activo', 'centro-derecha', 'aprobado', 'ok', 'p1', 52, 100, 4, 's17,s14,s7', '4454354454', 'familia,madurez', ''],
  ['f04', 'Carolina', 'Sosa', 'F', 39, 'Recoleta', 'abogada', 'posgrado', 'catolica', 'mensual', '<1a', 'tiene, no quiere más', 'familia,fe,lealtad,compromiso', 'lectura,trekking,vino,cocina', 'tranquilo', 'centro', 'aprobado', 'ok', 'p2', 110, 100, 3, 's17,s8', '4444354444', 'madurez', ''],
  ['f05', 'Micaela', 'Benítez', 'F', 34, 'San Isidro', 'contadora', 'universitario', 'agnostica', 'no practica', '2-3a', 'quiere', 'libertad,humor,trabajo', 'danza,viajes,musica', 'social', 'centro-izquierda', 'aprobado', 'ok', 'p2', 83, 97, 3, 's5,s31', '3324242424', '', ''],
  ['f06', 'Florencia', 'Castro', 'F', 35, 'Vicente López', 'contadora', 'universitario', 'agnostica', 'no practica', '2-3a', 'quiere', 'libertad,humor,trabajo,familia', 'danza,viajes,musica,cocina', 'social', 'centro-izquierda', 'aprobado', 'ok', 'p3', 61, 98, 4, 's5,s6,s17', '3334343434', '', ''],
  ['f07', 'Agustina', 'Romero', 'F', 30, 'Belgrano', 'psicopedagoga', 'universitario', 'catolica', 'semanal', '<1a', 'quiere', 'familia,fe,solidaridad', 'voluntariado,lectura,danza', 'tranquilo', 'centro', 'pendiente', 'ok', 'p1', 4, 86, 3, 's10,s24', '4454354454', '', ''],
  ['f08', 'Julieta', 'Navarro', 'F', 37, 'Rosario', 'docente_f', 'universitario', 'evangelica', 'semanal', '<1a', 'quiere', 'fe,familia,honestidad,generosidad', 'musica,voluntariado,cocina', 'hogareno', 'centro', 'aprobado', 'ok', 'p3', 99, 100, 3, 's9,s10,s13', '5455355454', 'mismaFe,familia', ''],
  ['f09', 'Camila', 'Ortiz', 'F', 32, 'Palermo', 'periodista', 'universitario', 'espiritual', 'no practica', '2-3a', 'quiere', 'libertad,humor,honestidad,solidaridad', 'musica,yoga,fotografia,cine', 'social', 'centro-izquierda', 'aprobado', 'ok', 'p2', 38, 96, 4, 's2,s3,s28', '4334242434', 'comunicacion', ''],
  ['f10', 'Mariana', 'Suárez', 'F', 42, 'Córdoba', 'odontologa', 'universitario', 'catolica', 'mensual', '1-2a', 'tiene y quiere más', 'familia,respeto,humor', 'cocina,trekking,danza', 'social', 'centro', 'aprobado', 'ok', 'p3', 125, 95, 3, 's4,s27', '4434344444', '', ''],
  ['f11', 'Daniela', 'Molina', 'F', 44, 'San Isidro', 'empresaria', 'universitario', 'catolica', 'semanal', '<1a', 'tiene y quiere más', 'familia,fe,tradicion,generosidad', 'jardineria,vino,tenis', 'hogareno', 'centro-derecha', 'aprobado', 'ok', 'p1', 150, 100, 4, 's19,s18', '4354354553', 'familia', ''],
  ['f12', 'Natalia', 'Vega', 'F', 38, 'Recoleta', 'traductora', 'posgrado', 'catolica', 'ocasional', '1-2a', 'quiere', 'familia,honestidad,humor,trabajo', 'lectura,viajes,running,teatro', 'tranquilo', 'centro', 'aprobado', 'ok', 'p1', 66, 100, 4, 's11,s1,s25', '4343454344', 'comunicacion', ''],
  ['f13', 'Victoria', 'Acosta', 'F', 40, 'Núñez', 'farmaceutica', 'universitario', 'judia', 'mensual', '1-2a', 'quiere', 'familia,tradicion,respeto,trabajo', 'tenis,lectura,viajes', 'tranquilo', 'centro', 'aprobado', 'ok', 'p2', 92, 99, 3, 's29,s15', '3454444354', 'mismaFe', ''],
  ['f14', 'Laura', 'Benavídez', 'F', 48, 'Mendoza', 'enfermera', 'terciario', 'catolica', 'mensual', '1-2a', 'tiene, no quiere más', 'familia,trabajo,lealtad', 'jardineria,cocina,trekking', 'tranquilo', 'centro-derecha', 'aprobado', 'ok', 'p3', 170, 94, 3, 's7,s8,s26', '3443443443', 'madurez', ''],
  ['f15', 'Carla', 'Fuentes', 'F', 36, 'La Plata', 'veterinaria', 'universitario', 'catolica', 'ocasional', '1-2a', 'quiere', 'familia,solidaridad', 'bici,voluntariado', 'activo', 'centro', 'pausa', 'ok', 'p1', 115, 100, 3, 's11', '4343434344', '', ''],
  ['f16', 'Gabriela', 'Rossi', 'F', 35, 'Belgrano', 'rrhh', 'posgrado', 'catolica', 'semanal', '<1a', 'quiere', 'familia,fe,compromiso,generosidad', 'running,cocina,danza', 'activo', 'centro-derecha', 'aprobado', 'ok', 'p1', 29, 100, 4, 's17,s24,s13', '4454354444', 'familia', ''],
  ['f17', 'Verónica', 'Álvarez', 'F', 41, 'Caballito', 'docente_f', 'universitario', 'cristiana', 'mensual', '1-2a', 'quiere', 'familia,respeto,humor', 'cine,teatro,cocina', 'tranquilo', 'centro', 'aprobado', 'ok', 'p2', 101, 93, 3, 's27,s20', '4344344444', '', ''],
  ['f18', 'Silvina', 'Moreno', 'F', 46, 'Rosario', 'comerciante', 'secundario', 'agnostica', 'no practica', '2-3a', 'no quiere', 'libertad', 'danza,viajes', 'social', 'apolitico', 'rechazado', 'reembolsado', 'p3', 80, 85, 2, 's31', '2324232323', 'duelo', ''],
  ['f19', 'Luciana', 'Pereyra', 'F', 37, 'Palermo', 'arquitecta', 'posgrado', 'espiritual', 'no practica', '1-2a', 'quiere', 'familia,humor,libertad,honestidad', 'musica,yoga,viajes,pintura', 'social', 'centro-izquierda', 'aprobado', 'ok', 'p2', 55, 99, 4, 's1,s16,s12', '5434353434', 'comunicacion', ''],
  ['f20', 'Belén', 'Carrizo', 'F', 31, 'Córdoba', 'enfermera', 'terciario', 'catolica', 'semanal', '<1a', 'quiere', 'familia,fe,solidaridad', 'danza,cocina,voluntariado', 'social', 'centro', 'pendiente', 'ok', 'p3', 7, 84, 2, 's10,s9', '4454354454', '', ''],
  ['f21', 'Inés', 'Lozano', 'F', 28, 'Vicente López', 'disenadora', 'terciario', 'espiritual', 'no practica', '2-3a', 'quiere', 'libertad', 'yoga,pintura', 'social', '', 'incompleto', 'pendiente', 'p2', 2, 40, 0, 's16', '43', '', ''],
  ['f22', 'Cecilia', 'Blanco', 'F', 50, 'La Plata', 'profesora', 'universitario', 'catolica', 'ocasional', '2-3a', 'no quiere', 'trabajo,libertad', 'teatro,lectura', 'tranquilo', 'centro', 'rechazado', 'reembolsado', 'p1', 95, 88, 2, 's20', '2323233232', 'duelo', ''],
  ['f23', 'Mercedes', 'Ponce', 'F', 45, 'Recoleta', 'abogada', 'posgrado', 'catolica', 'semanal', '1-2a', 'tiene y quiere más', 'familia,fe,tradicion', 'lectura,vino', 'hogareno', 'centro-derecha', 'pausa', 'ok', 'p2', 190, 100, 3, 's18,s19', '4354354453', '', ''],
  ['f24', 'Ana Clara', 'Zapata', 'F', 29, 'Mendoza', 'chef', 'terciario', 'catolica', 'ocasional', '2-3a', 'quiere', 'humor', 'cocina', 'social', '', 'incompleto', 'pendiente', 'p3', 1, 25, 0, '', '4', '', ''],
]

const CUSTOM_BIOS: Record<string, Bi> = {
  h01: {
    es: 'Soy arquitecto y vivo en Palermo. Me gusta diseñar espacios donde la gente se sienta en casa, y eso es lo que busco en una pareja: construir un hogar juntos. Los domingos cocino para mi familia, salgo en bici y saco fotos de la ciudad. Quiero casarme y ser papá en los próximos años.',
    en: 'I’m an architect living in Palermo. I love designing spaces where people feel at home, and that’s what I’m looking for in a partner: building a home together. On Sundays I cook for my family, ride my bike and photograph the city. I want to get married and become a dad in the coming years.',
  },
  f02: {
    es: 'Diseñadora, curiosa y muy familiera. Me encanta viajar con la cámara colgada y terminar el día cocinando con amigos. Creo en el amor que se elige todos los días. Busco un compañero con quien formar una familia y seguir descubriendo el mundo.',
    en: 'Designer, curious and very family-oriented. I love traveling with my camera and ending the day cooking with friends. I believe in a love that is chosen every day. I’m looking for a partner to start a family with and keep discovering the world.',
  },
  h02: {
    es: 'Abogado, de misa los domingos y de asado con amigos. La fe y la familia son el centro de mi vida. Me gusta caminar en la montaña y leer historia. Busco una compañera para casarnos pronto y formar una familia grande.',
    en: 'Lawyer, Sunday Mass and barbecue with friends. Faith and family are at the center of my life. I enjoy mountain hikes and reading history. I’m looking for a partner to marry soon and raise a big family.',
  },
  f03: {
    es: 'Médica pediatra, apasionada por lo que hago. Mi fe me sostiene y la familia es lo más importante. Me encanta cocinar, caminar por la montaña y un buen libro. Estoy lista para casarme y ser mamá.',
    en: 'Pediatrician, passionate about my work. My faith sustains me and family comes first. I love cooking, mountain hikes and a good book. I’m ready to get married and become a mom.',
  },
}

function makeBio(r: Row): Bi {
  if (CUSTOM_BIOS[r[0]]) return CUSTOM_BIOS[r[0]]
  const prof = PROFESIONES[r[6]] ?? { es: r[6], en: r[6] }
  const hobbies = r[13].split(',').filter(Boolean).slice(0, 2).map((h) => HOBBIES[h])
  const h1 = hobbies[0] ?? { es: 'leer', en: 'reading' }
  const h2 = hobbies[1] ?? { es: 'viajar', en: 'traveling' }
  const busca = r[3] === 'M' ? { es: 'una compañera', en: 'a partner' } : { es: 'un compañero', en: 'a partner' }
  return {
    es: `${prof.es} en ${r[5]}. En mi tiempo libre disfruto de ${h1.es.toLowerCase()} y ${h2.es.toLowerCase()}. Busco ${busca.es} con quien compartir la vida, formar un hogar y crecer juntos con respeto y alegría.`,
    en: `${prof.en} in ${r[5]}. In my free time I enjoy ${h1.en.toLowerCase()} and ${h2.en.toLowerCase()}. I’m looking for ${busca.en} to share life with, build a home and grow together with respect and joy.`,
  }
}

const HISTORIAS: Bi[] = [
  { es: 'Tuve una relación de 6 años que terminó en buenos términos. Aprendí la importancia de hablar las cosas a tiempo.', en: 'I had a 6-year relationship that ended on good terms. I learned how important it is to talk things through in time.' },
  { es: 'Estuve casado/a y me divorcié hace varios años. Hoy me siento en paz y con ganas de volver a apostar.', en: 'I was married and divorced several years ago. Today I feel at peace and ready to commit again.' },
  { es: 'Relaciones cortas en los últimos años, priorizando la carrera. Hoy mi prioridad es formar una familia.', en: 'Short relationships in recent years while prioritizing my career. Today my priority is starting a family.' },
  { es: 'Una relación larga en la facultad y otra de 3 años. Sé lo que quiero y lo que no.', en: 'A long relationship in college and another of 3 years. I know what I want and what I don’t.' },
]
const ASPIRACIONES: Bi[] = [
  { es: 'Casarme, tener hijos y una casa con patio donde se junte la familia.', en: 'Get married, have children and a house with a yard where the family gathers.' },
  { es: 'Formar un matrimonio compañero, viajar juntos y envejecer riéndonos.', en: 'Build a partnership, travel together and grow old laughing.' },
  { es: 'Construir una familia con valores sólidos y mucho diálogo.', en: 'Build a family with solid values and lots of dialogue.' },
]
const TEXTOS_LIBRES: Bi[] = [
  { es: 'Para mí el amor es elegir al otro incluso en los días difíciles.', en: 'To me, love is choosing the other person even on hard days.' },
  { es: 'Necesito una pareja que sea también mi mejor amiga/o.', en: 'I need a partner who is also my best friend.' },
  { es: 'Me importa que podamos rezar y agradecer juntos.', en: 'It matters to me that we can pray and give thanks together.' },
  { es: 'Busco calma, respeto y un proyecto en común.', en: 'I’m looking for calm, respect and a shared project.' },
]

function buildMember(r: Row, i: number): Member {
  const [id, nombre, apellido, genero, edad, ciudad, profesion, educacion, fe, practica, intencion, hijos,
    valores, hobbies, estilo, politica, estado, pago, psico, diasAlta, completitud, nFotos,
    canciones, cuest, tags, rech] = r
  const songIds = canciones.split(',').filter(Boolean)
  return {
    id, nombre, apellido, genero, edad, ciudad, profesion, educacion, fe,
    practicaReligiosa: practica,
    intencionCasarse: intencion,
    hijos,
    valores: valores.split(',').filter(Boolean),
    hobbies: hobbies.split(',').filter(Boolean),
    estiloVida: estilo,
    politica: politica || undefined,
    estado, pago,
    psicologaId: psico,
    fechaAlta: subDays(TODAY, diasAlta).toISOString(),
    completitud,
    bio: makeBio(r),
    historia: HISTORIAS[i % HISTORIAS.length],
    aspiraciones: ASPIRACIONES[i % ASPIRACIONES.length],
    cuestionario: cuest.split('').map((v, k) => ({ qid: `q${k + 1}`, value: Number(v) })),
    textoLibre: TEXTOS_LIBRES[i % TEXTOS_LIBRES.length],
    fotos: Array.from({ length: nFotos }, (_, k) => ({ id: `${id}-ph${k + 1}`, esPortada: k === 0, orden: k })),
    canciones: songIds.map((sid, k) => ({
      id: `${id}-${sid}`,
      titulo: SONGS[sid].titulo,
      artista: SONGS[sid].artista,
      porQue: PORQUE[(i * 3 + k) % PORQUE.length],
      esCancionIdeal: k === 0,
      orden: k,
    })),
    rechazados: rech.split(',').filter(Boolean),
    etiquetasPsico: tags.split(',').filter(Boolean),
    motivoRechazo:
      estado === 'rechazado'
        ? { es: 'No manifiesta intención matrimonial en el corto plazo.', en: 'No marriage intent in the short term.' }
        : undefined,
  }
}

export const INITIAL_MEMBERS: Member[] = ROWS.map(buildMember)

export const MARTIN_ID = 'h01'
/** La psicóloga demo es Lic. Carolina Méndez */
export const PSICO_ID = 'p1'
export const DEFAULT_ADMIN_MEMBER = 'h02'

/** Pares que ya fueron presentados (para "Evitar matches repetidos") */
export const PRESENTED_PAIRS: [string, string][] = [
  ['h02', 'f16'],
  ['h09', 'f12'],
  ['h13', 'f03'],
]
