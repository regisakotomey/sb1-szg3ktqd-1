'use client';

interface OpeningHours {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

interface PlaceBusinessHoursProps {
  openingHours: OpeningHours[];
}

export default function PlaceBusinessHours({ openingHours }: PlaceBusinessHoursProps) {
  // Réorganiser les jours pour commencer par Lundi
  const orderedDays = [
    'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'
  ];

  const sortedHours = [...openingHours].sort((a, b) => 
    orderedDays.indexOf(a.day) - orderedDays.indexOf(b.day)
  );

  // Regrouper les jours consécutifs avec les mêmes horaires
  const groupedHours = sortedHours.reduce((acc: any[], current, index) => {
    if (index === 0) {
      return [{ ...current, days: [current.day] }];
    }

    const previous = acc[acc.length - 1];
    const hasSameHours = previous.isOpen === current.isOpen &&
      previous.openTime === current.openTime &&
      previous.closeTime === current.closeTime;

    if (hasSameHours) {
      previous.days.push(current.day);
    } else {
      acc.push({ ...current, days: [current.day] });
    }

    return acc;
  }, []);

  return (
    <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4">Horaires d'ouverture</h2>
      <div className="space-y-3">
        {groupedHours.map((group, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex-1">
              <span className="font-medium">
                {group.days.length === 1 
                  ? group.days[0]
                  : `${group.days[0]} - ${group.days[group.days.length - 1]}`
                }
              </span>
            </div>
            <div className="text-right">
              {group.isOpen ? (
                <span className="text-gray-600">
                  {group.openTime} - {group.closeTime}
                </span>
              ) : (
                <span className="text-gray-500">Fermé</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}