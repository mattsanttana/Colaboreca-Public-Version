// Define um tipo genérico para criar uma nova entidade, omitindo o campo 'id'.
// Útil para operações de criação (POST), onde o 'id' ainda não foi gerado.
export type NewEntity<T> = Omit<T, 'id'>;

// Define um tipo para representar IDs, que são números.
// Útil para padronizar o tipo de identificadores em todo o projeto.
export type ID = number;

// Define um tipo para entidades que possuem um identificador único (id).
// Útil para garantir que objetos tenham um campo 'id' padronizado.
export type Identifiable = { id: ID };

// Define um tipo para representar parâmetros de consulta (query strings).
// Útil para manipular queries em requisições HTTP, permitindo valores de diferentes tipos.
export type Query = { [key: string]: string | number | boolean };