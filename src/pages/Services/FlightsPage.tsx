import ServiceManagementPage from '@/components/Services/ServiceManagementPage';
import { Plane } from 'lucide-react';

export default function FlightsPage() {
    return (
        <ServiceManagementPage
            type="flights"
            title="Flights Management"
            description="View and manage all flights bookings."
            icon={<Plane size={24} />}
        />
    );
}
