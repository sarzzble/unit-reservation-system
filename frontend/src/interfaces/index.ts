export interface Reservation {
  id: number;
  unit: {
    number: string;
  };
  date: string;
  time_slot: string;
}

export interface User {
  name: string;
  surname: string;
  student_number: string;
  email: string;
  student_class: string;
}

export interface Unit {
  id: number;
  number: string;
  reserved_time_slots: string[];
  available_time_slots: string[];
}
