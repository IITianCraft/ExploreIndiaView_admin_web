import ServiceManagementPage from '@/components/Services/ServiceManagementPage';
import { Car } from 'lucide-react';

export default function CabsPage() {
    return (
        <ServiceManagementPage
            type="cabs"
            title="Cabs Management"
            description="View and manage all cab bookings."
            icon={<Car size={24} />}
        />
    );
}
