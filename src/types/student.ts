export interface Student {
  id: string;
  name: string;
  email: string;
  grade: string;
  status: 'Active' | 'Pending' | 'Inactive';
  enrolledDate: string;
}

export interface Course {
  code: string;
  title: string;
  instructor: string;
  department: string;
  enrolled: number;
  schedule: string;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatar: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'danger' | 'info';
}
