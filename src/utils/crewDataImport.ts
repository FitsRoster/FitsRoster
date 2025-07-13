
import { crewService } from '../services/crewService';

export const crewMembersData = [
  // Captains
  { name: 'Ruwan Vithanage', role: 'Captain' as const, totalFlightHours: 8000, totalDutyHours: 12000, restHours: 12, certifications: ['A320', 'A330'] },
  { name: 'Suranga Samarasinghe', role: 'Captain' as const, totalFlightHours: 7500, totalDutyHours: 11500, restHours: 12, certifications: ['A320', 'A330'] },
  { name: 'Prasad Herath', role: 'Captain' as const, totalFlightHours: 9000, totalDutyHours: 13000, restHours: 12, certifications: ['A320', 'A330', 'B777'] },
  { name: 'Marlon Perera', role: 'Captain' as const, totalFlightHours: 8500, totalDutyHours: 12500, restHours: 12, certifications: ['A320', 'A330'] },
  { name: 'Manoj John', role: 'Captain' as const, totalFlightHours: 7800, totalDutyHours: 11800, restHours: 12, certifications: ['A320'] },
  { name: 'Rajeewa Senanayake', role: 'Captain' as const, totalFlightHours: 8200, totalDutyHours: 12200, restHours: 12, certifications: ['A320', 'A330'] },
  { name: 'Chanthee Rodrigo', role: 'Captain' as const, totalFlightHours: 7600, totalDutyHours: 11600, restHours: 12, certifications: ['A320'] },
  { name: 'Kevin Castro', role: 'Captain' as const, totalFlightHours: 8800, totalDutyHours: 12800, restHours: 12, certifications: ['A320', 'A330'] },
  { name: 'Artem Kovtun', role: 'Captain' as const, totalFlightHours: 9200, totalDutyHours: 13200, restHours: 12, certifications: ['A320', 'A330', 'B777'] },
  { name: 'Aditya Anwar', role: 'Captain' as const, totalFlightHours: 7400, totalDutyHours: 11400, restHours: 12, certifications: ['A320'] },
  { name: 'Ashan De Alwis', role: 'Captain' as const, totalFlightHours: 8100, totalDutyHours: 12100, restHours: 12, certifications: ['A320', 'A330'] },
  { name: 'Philippe Chan You Ke', role: 'Captain' as const, totalFlightHours: 8600, totalDutyHours: 12600, restHours: 12, certifications: ['A320', 'A330'] },
  { name: 'Uditha Danwatte', role: 'Captain' as const, totalFlightHours: 7700, totalDutyHours: 11700, restHours: 12, certifications: ['A320'] },
  { name: 'Johann Pieris', role: 'Captain' as const, totalFlightHours: 8300, totalDutyHours: 12300, restHours: 12, certifications: ['A320', 'A330'] },
  { name: 'Abhinav Jain', role: 'Captain' as const, totalFlightHours: 8900, totalDutyHours: 12900, restHours: 12, certifications: ['A320', 'A330'] },
  { name: 'Krishna Pala', role: 'Captain' as const, totalFlightHours: 7900, totalDutyHours: 11900, restHours: 12, certifications: ['A320'] },

  // First Officers
  { name: 'Pasan Perera', role: 'First Officer' as const, totalFlightHours: 3500, totalDutyHours: 5500, restHours: 10, certifications: ['A320'] },
  { name: 'Sagara Wirasinha', role: 'First Officer' as const, totalFlightHours: 3200, totalDutyHours: 5200, restHours: 10, certifications: ['A320'] },
  { name: 'Asanga Serasingha', role: 'First Officer' as const, totalFlightHours: 3800, totalDutyHours: 5800, restHours: 10, certifications: ['A320', 'A330'] },
  { name: 'Eranjith Nugawela', role: 'First Officer' as const, totalFlightHours: 3400, totalDutyHours: 5400, restHours: 10, certifications: ['A320'] },
  { name: 'Uditha Balachandra', role: 'First Officer' as const, totalFlightHours: 3600, totalDutyHours: 5600, restHours: 10, certifications: ['A320'] },
  { name: 'Ashik Kottuthodi', role: 'First Officer' as const, totalFlightHours: 3300, totalDutyHours: 5300, restHours: 10, certifications: ['A320'] },
  { name: 'Ishan Gunaratne', role: 'First Officer' as const, totalFlightHours: 3700, totalDutyHours: 5700, restHours: 10, certifications: ['A320', 'A330'] },
  { name: 'Kostiantyn Ianovyi', role: 'First Officer' as const, totalFlightHours: 3900, totalDutyHours: 5900, restHours: 10, certifications: ['A320'] },
  { name: 'Tharindu Semasinghe', role: 'First Officer' as const, totalFlightHours: 3100, totalDutyHours: 5100, restHours: 10, certifications: ['A320'] },
  { name: 'Dimuthu Ferdinando', role: 'First Officer' as const, totalFlightHours: 3500, totalDutyHours: 5500, restHours: 10, certifications: ['A320'] },
  { name: 'Chamila Dhanapaala', role: 'First Officer' as const, totalFlightHours: 3400, totalDutyHours: 5400, restHours: 10, certifications: ['A320'] },
  { name: 'L D L B KARALLIYADDE', role: 'First Officer' as const, totalFlightHours: 3600, totalDutyHours: 5600, restHours: 10, certifications: ['A320'] },
  { name: 'Udaya Weerakoon', role: 'First Officer' as const, totalFlightHours: 3800, totalDutyHours: 5800, restHours: 10, certifications: ['A320', 'A330'] },
  { name: 'Kalum Athukorala', role: 'First Officer' as const, totalFlightHours: 3200, totalDutyHours: 5200, restHours: 10, certifications: ['A320'] },
  { name: 'T M D G R Peiris', role: 'First Officer' as const, totalFlightHours: 3700, totalDutyHours: 5700, restHours: 10, certifications: ['A320'] },
  { name: 'Sajeewa Hendawitharane', role: 'First Officer' as const, totalFlightHours: 3300, totalDutyHours: 5300, restHours: 10, certifications: ['A320'] },
  { name: 'Imal Tennakoon', role: 'First Officer' as const, totalFlightHours: 3500, totalDutyHours: 5500, restHours: 10, certifications: ['A320'] },
  { name: 'Roshani Jinasena', role: 'First Officer' as const, totalFlightHours: 3400, totalDutyHours: 5400, restHours: 10, certifications: ['A320'] },

  // Flight Attendants (Cabin Crew)
  { name: 'Jude Grogary', role: 'Flight Attendant' as const, totalFlightHours: 2200, totalDutyHours: 4200, restHours: 8, certifications: ['Safety', 'Service'] },
  { name: 'Menul Galahitiyawa', role: 'Flight Attendant' as const, totalFlightHours: 1800, totalDutyHours: 3800, restHours: 8, certifications: ['Safety'] },
  { name: 'Gayathri De Soyza', role: 'Flight Attendant' as const, totalFlightHours: 2100, totalDutyHours: 4100, restHours: 8, certifications: ['Safety', 'Service'] },
  { name: 'Ishan Ragunath', role: 'Flight Attendant' as const, totalFlightHours: 1900, totalDutyHours: 3900, restHours: 8, certifications: ['Safety'] },
  { name: 'Lumena Ranasinghe', role: 'Flight Attendant' as const, totalFlightHours: 2000, totalDutyHours: 4000, restHours: 8, certifications: ['Safety', 'Service'] },
  { name: 'Lozanne de Silva', role: 'Flight Attendant' as const, totalFlightHours: 1700, totalDutyHours: 3700, restHours: 8, certifications: ['Safety'] },
  { name: 'H B S HETTIARACHCHI', role: 'Flight Attendant' as const, totalFlightHours: 2300, totalDutyHours: 4300, restHours: 8, certifications: ['Safety', 'Service'] },
  { name: 'Unithas Bandaranayake', role: 'Flight Attendant' as const, totalFlightHours: 1600, totalDutyHours: 3600, restHours: 8, certifications: ['Safety'] },
  { name: 'Jayden Jaleel', role: 'Flight Attendant' as const, totalFlightHours: 2000, totalDutyHours: 4000, restHours: 8, certifications: ['Safety'] },
  { name: 'Varun Sethunathan', role: 'Flight Attendant' as const, totalFlightHours: 1800, totalDutyHours: 3800, restHours: 8, certifications: ['Safety'] },
  { name: 'Shanaya Babar', role: 'Flight Attendant' as const, totalFlightHours: 2100, totalDutyHours: 4100, restHours: 8, certifications: ['Safety', 'Service'] },
  { name: 'Ashma Sadiyan', role: 'Flight Attendant' as const, totalFlightHours: 1900, totalDutyHours: 3900, restHours: 8, certifications: ['Safety'] },
  { name: 'Shehani Perera', role: 'Flight Attendant' as const, totalFlightHours: 2200, totalDutyHours: 4200, restHours: 8, certifications: ['Safety', 'Service'] },
  { name: 'Hansini Kurukulasooriya', role: 'Flight Attendant' as const, totalFlightHours: 1700, totalDutyHours: 3700, restHours: 8, certifications: ['Safety'] },
  { name: 'Sanchala Fernando', role: 'Flight Attendant' as const, totalFlightHours: 2000, totalDutyHours: 4000, restHours: 8, certifications: ['Safety'] },
  { name: 'Anjaleena Wijesooriya', role: 'Flight Attendant' as const, totalFlightHours: 1800, totalDutyHours: 3800, restHours: 8, certifications: ['Safety'] },
  { name: 'Deeniya Ahmed', role: 'Flight Attendant' as const, totalFlightHours: 2100, totalDutyHours: 4100, restHours: 8, certifications: ['Safety', 'Service'] },
  { name: 'NUSHKA NUHUMAN', role: 'Flight Attendant' as const, totalFlightHours: 1900, totalDutyHours: 3900, restHours: 8, certifications: ['Safety'] },
  { name: 'Stephani Premnath', role: 'Flight Attendant' as const, totalFlightHours: 2000, totalDutyHours: 4000, restHours: 8, certifications: ['Safety'] },
  { name: 'KITHMINI GUNASEKARA', role: 'Flight Attendant' as const, totalFlightHours: 1600, totalDutyHours: 3600, restHours: 8, certifications: ['Safety'] },
  { name: 'NATASHA Benedict', role: 'Flight Attendant' as const, totalFlightHours: 2200, totalDutyHours: 4200, restHours: 8, certifications: ['Safety', 'Service'] },
  { name: 'Tharaka Wijesingha', role: 'Flight Attendant' as const, totalFlightHours: 1800, totalDutyHours: 3800, restHours: 8, certifications: ['Safety'] },
  { name: 'Saumya Karandawatta', role: 'Flight Attendant' as const, totalFlightHours: 2100, totalDutyHours: 4100, restHours: 8, certifications: ['Safety', 'Service'] },
  { name: 'Thushanka Perera', role: 'Flight Attendant' as const, totalFlightHours: 1700, totalDutyHours: 3700, restHours: 8, certifications: ['Safety'] },
  { name: 'Umudith Makalanda', role: 'Flight Attendant' as const, totalFlightHours: 1900, totalDutyHours: 3900, restHours: 8, certifications: ['Safety'] },
  { name: 'A C O Batcho', role: 'Flight Attendant' as const, totalFlightHours: 2000, totalDutyHours: 4000, restHours: 8, certifications: ['Safety'] },
  { name: 'Yashodara Ramanayake', role: 'Flight Attendant' as const, totalFlightHours: 1800, totalDutyHours: 3800, restHours: 8, certifications: ['Safety'] },
  { name: 'Prasath Sivanantham', role: 'Flight Attendant' as const, totalFlightHours: 2200, totalDutyHours: 4200, restHours: 8, certifications: ['Safety', 'Service'] },
  { name: 'Hashini Perera', role: 'Flight Attendant' as const, totalFlightHours: 1600, totalDutyHours: 3600, restHours: 8, certifications: ['Safety'] },
  { name: 'Loshini Pilana Vithanage', role: 'Flight Attendant' as const, totalFlightHours: 2100, totalDutyHours: 4100, restHours: 8, certifications: ['Safety', 'Service'] },
  { name: 'Shehezara Sheriffdeen', role: 'Flight Attendant' as const, totalFlightHours: 1900, totalDutyHours: 3900, restHours: 8, certifications: ['Safety'] },
  { name: 'Sithija Wethalawa', role: 'Flight Attendant' as const, totalFlightHours: 2000, totalDutyHours: 4000, restHours: 8, certifications: ['Safety'] },
  { name: 'Raveesha Pathiranage', role: 'Flight Attendant' as const, totalFlightHours: 1700, totalDutyHours: 3700, restHours: 8, certifications: ['Safety'] },
  { name: 'Navodya Alahendra', role: 'Flight Attendant' as const, totalFlightHours: 1800, totalDutyHours: 3800, restHours: 8, certifications: ['Safety'] },
  { name: 'Akila kuruppu Arachchige', role: 'Flight Attendant' as const, totalFlightHours: 2200, totalDutyHours: 4200, restHours: 8, certifications: ['Safety', 'Service'] },
  { name: 'Keshala Perera', role: 'Flight Attendant' as const, totalFlightHours: 1900, totalDutyHours: 3900, restHours: 8, certifications: ['Safety'] },
  { name: 'Dilukshan Ramesh', role: 'Flight Attendant' as const, totalFlightHours: 2100, totalDutyHours: 4100, restHours: 8, certifications: ['Safety', 'Service'] },
  { name: 'Dewangi Kodithuwakku', role: 'Flight Attendant' as const, totalFlightHours: 1600, totalDutyHours: 3600, restHours: 8, certifications: ['Safety'] },
  { name: 'J Jeykishan', role: 'Flight Attendant' as const, totalFlightHours: 2000, totalDutyHours: 4000, restHours: 8, certifications: ['Safety'] },
  { name: 'Tanaka Waidyarathne', role: 'Flight Attendant' as const, totalFlightHours: 1800, totalDutyHours: 3800, restHours: 8, certifications: ['Safety'] },
  { name: 'Pooja Kumari', role: 'Flight Attendant' as const, totalFlightHours: 2200, totalDutyHours: 4200, restHours: 8, certifications: ['Safety', 'Service'] },
  { name: 'Kulani Wijesinghe', role: 'Flight Attendant' as const, totalFlightHours: 1700, totalDutyHours: 3700, restHours: 8, certifications: ['Safety'] },
  { name: 'Abdul Hamidon', role: 'Flight Attendant' as const, totalFlightHours: 1900, totalDutyHours: 3900, restHours: 8, certifications: ['Safety'] },
  { name: 'Ashwini Piyathunga', role: 'Flight Attendant' as const, totalFlightHours: 2000, totalDutyHours: 4000, restHours: 8, certifications: ['Safety'] },
  { name: 'Dilesh Elikewela', role: 'Flight Attendant' as const, totalFlightHours: 1800, totalDutyHours: 3800, restHours: 8, certifications: ['Safety'] },
  { name: 'Ayshka Jayman', role: 'Flight Attendant' as const, totalFlightHours: 2100, totalDutyHours: 4100, restHours: 8, certifications: ['Safety', 'Service'] },
  { name: 'Chamodya Weerasinghe', role: 'Flight Attendant' as const, totalFlightHours: 1600, totalDutyHours: 3600, restHours: 8, certifications: ['Safety'] },
  { name: 'Darren Diaz', role: 'Flight Attendant' as const, totalFlightHours: 2200, totalDutyHours: 4200, restHours: 8, certifications: ['Safety', 'Service'] },
  { name: 'Kaveesha Hewa Waduge', role: 'Flight Attendant' as const, totalFlightHours: 1900, totalDutyHours: 3900, restHours: 8, certifications: ['Safety'] },
  { name: 'Mhahsooda Wajee', role: 'Flight Attendant' as const, totalFlightHours: 2000, totalDutyHours: 4000, restHours: 8, certifications: ['Safety'] },
  { name: 'Netasha Karunaratne', role: 'Flight Attendant' as const, totalFlightHours: 1700, totalDutyHours: 3700, restHours: 8, certifications: ['Safety'] },
  { name: 'Nimsara Narasinghe', role: 'Flight Attendant' as const, totalFlightHours: 1800, totalDutyHours: 3800, restHours: 8, certifications: ['Safety'] },
  { name: 'Parami Kodagoda', role: 'Flight Attendant' as const, totalFlightHours: 2100, totalDutyHours: 4100, restHours: 8, certifications: ['Safety', 'Service'] },
  { name: 'Rikaza Fathima', role: 'Flight Attendant' as const, totalFlightHours: 1900, totalDutyHours: 3900, restHours: 8, certifications: ['Safety'] },
  { name: 'Shanie Kaushalya', role: 'Flight Attendant' as const, totalFlightHours: 2000, totalDutyHours: 4000, restHours: 8, certifications: ['Safety'] },
  { name: 'Sharown Donald Paskar', role: 'Flight Attendant' as const, totalFlightHours: 1600, totalDutyHours: 3600, restHours: 8, certifications: ['Safety'] },
  { name: 'Shehara Ashni', role: 'Flight Attendant' as const, totalFlightHours: 2200, totalDutyHours: 4200, restHours: 8, certifications: ['Safety', 'Service'] },
  { name: 'Subhath Peiris', role: 'Flight Attendant' as const, totalFlightHours: 1800, totalDutyHours: 3800, restHours: 8, certifications: ['Safety'] },
  { name: 'Thisum Ranasinghe', role: 'Flight Attendant' as const, totalFlightHours: 2100, totalDutyHours: 4100, restHours: 8, certifications: ['Safety', 'Service'] },
  { name: 'Thineth Prabudda', role: 'Flight Attendant' as const, totalFlightHours: 1700, totalDutyHours: 3700, restHours: 8, certifications: ['Safety'] },
  { name: 'Yamini Kannappan', role: 'Flight Attendant' as const, totalFlightHours: 1900, totalDutyHours: 3900, restHours: 8, certifications: ['Safety'] },

  // Senior Cabin Crew (Flight Attendants with Senior designation)
  { name: 'Plumi Kulasooriya', role: 'Flight Attendant' as const, totalFlightHours: 4500, totalDutyHours: 6500, restHours: 8, certifications: ['Safety', 'Service', 'Senior'] },
  { name: 'Janaka SUBASINGHE', role: 'Flight Attendant' as const, totalFlightHours: 4200, totalDutyHours: 6200, restHours: 8, certifications: ['Safety', 'Service', 'Senior'] },
  { name: 'Josha Galagedaragge', role: 'Flight Attendant' as const, totalFlightHours: 4800, totalDutyHours: 6800, restHours: 8, certifications: ['Safety', 'Service', 'Senior'] },
  { name: 'Layan Rajapakse', role: 'Flight Attendant' as const, totalFlightHours: 4300, totalDutyHours: 6300, restHours: 8, certifications: ['Safety', 'Service', 'Senior'] },
  { name: 'K Athukorala', role: 'Flight Attendant' as const, totalFlightHours: 4600, totalDutyHours: 6600, restHours: 8, certifications: ['Safety', 'Service', 'Senior'] },
  { name: 'Lasni Hettiarachchi', role: 'Flight Attendant' as const, totalFlightHours: 4100, totalDutyHours: 6100, restHours: 8, certifications: ['Safety', 'Service', 'Senior'] },
  { name: 'Imran Hannan', role: 'Flight Attendant' as const, totalFlightHours: 4700, totalDutyHours: 6700, restHours: 8, certifications: ['Safety', 'Service', 'Senior'] },
  { name: 'Shazarin Aniff', role: 'Flight Attendant' as const, totalFlightHours: 4400, totalDutyHours: 6400, restHours: 8, certifications: ['Safety', 'Service', 'Senior'] },
  { name: 'Harsha Weliwariya Liyanage', role: 'Flight Attendant' as const, totalFlightHours: 4900, totalDutyHours: 6900, restHours: 8, certifications: ['Safety', 'Service', 'Senior'] },
  { name: 'Supeshika Madusani', role: 'Flight Attendant' as const, totalFlightHours: 4200, totalDutyHours: 6200, restHours: 8, certifications: ['Safety', 'Service', 'Senior'] },
  { name: 'Namalee Kamaragoda', role: 'Flight Attendant' as const, totalFlightHours: 4500, totalDutyHours: 6500, restHours: 8, certifications: ['Safety', 'Service', 'Senior'] },
  { name: 'Maleesha Peiris', role: 'Flight Attendant' as const, totalFlightHours: 4300, totalDutyHours: 6300, restHours: 8, certifications: ['Safety', 'Service', 'Senior'] },
  { name: 'Ayesha Samarasinghe', role: 'Flight Attendant' as const, totalFlightHours: 4600, totalDutyHours: 6600, restHours: 8, certifications: ['Safety', 'Service', 'Senior'] },
  { name: 'Dinusha Nadeeshani', role: 'Flight Attendant' as const, totalFlightHours: 4100, totalDutyHours: 6100, restHours: 8, certifications: ['Safety', 'Service', 'Senior'] }
];

export const importCrewData = async () => {
  console.log('Starting crew data import...');
  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  for (const crewMember of crewMembersData) {
    try {
      await crewService.addCrewMember(crewMember);
      successCount++;
      console.log(`Added: ${crewMember.name}`);
    } catch (error) {
      errorCount++;
      const errorMessage = `Failed to add ${crewMember.name}: ${error}`;
      errors.push(errorMessage);
      console.error(errorMessage);
    }
  }

  console.log(`Import complete: ${successCount} successful, ${errorCount} failed`);
  
  return {
    successCount,
    errorCount,
    errors,
    total: crewMembersData.length
  };
};
