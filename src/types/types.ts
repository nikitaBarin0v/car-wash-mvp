export type BoxNumber = 1 | 2 | 3;

export interface WashProgram {
  id: number
  title: string
  duration: number
  price: number
  description: string
}

export interface Booking {
  id?: string
  created_at: string
  start_time: string
  end_time: string
  box_number: BoxNumber
  program_id: number
  client_name: string
  client_phone: string
  car_model: string
  car_number: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
}