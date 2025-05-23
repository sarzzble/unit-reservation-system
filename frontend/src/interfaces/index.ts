export interface Reservation {
  id: number;
  unit: {
    number: string;
  };
  date: string;
  time_slot: string;
}

export interface TeacherReservation extends Reservation {
  user: {
    first_name: string;
    last_name: string;
    student_number: string;
    student_class: string;
  };
}

export interface User {
  name: string;
  surname: string;
  student_number: string;
  email: string;
  student_class: string;
  is_staff: boolean;
}

export interface Unit {
  id: number;
  number: string;
  reserved_time_slots: string[];
  available_time_slots: string[];
}

export interface DutyTeacher {
  first_name: string;
  last_name: string;
  email: string;
}

export interface Student {
  student_number: string;
  first_name: string;
  last_name: string;
  student_class: string;
}
