export interface Festival {
  id: string;
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  workingHours: string;
  activities: string[];
  price: number; // in Baisa
  image?: string;
}

export const festivals: Festival[] = [
  {
    id: 'f4e03b10-403d-4d07-8e94-4d4974c2cb3d',
    name: 'مهرجان صحار الترفيهي',
    description: 'مهرجان سنوي يقام في مركز صحار الترفيهي يتضمن فعاليات ثقافية وترفيهية وعروض تراثية وأسواق شعبية',
    location: 'مركز صحار الترفيهي، ولاية صحار',
    startDate: '2024-01-15',
    endDate: '2024-01-25',
    workingHours: 'يومياً من 4:00 مساءً - 11:00 مساءً',
    activities: [
      'عروض تراثية',
      'أسواق شعبية',
      'فعاليات ثقافية وترفيهية',
    ],
    price: 500, // 500 Baisa
  },
];
