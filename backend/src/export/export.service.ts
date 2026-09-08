import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { UserRole } from '../auth/roles.enum';
import { UsersService } from '../users/users.service';
import { SeekersService } from '../seekers/seekers.service';
import { EmployersService } from '../employers/employers.service';
import { JobsService } from '../jobs/jobs.service';
import { ApplicationsService } from '../applications/applications.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CoordinatesService } from '../common/coordinates.service';

@Injectable()
export class ExportService {
    constructor(
        private userService: UsersService,
        private seekerService: SeekersService,
        private employerService: EmployersService,
        private jobService: JobsService,
        private applicationService: ApplicationsService,
        private notificationService: NotificationsService,
        private coordinatesService: CoordinatesService
    ) {}

    private addLambertToJob(job: any) {
      const { lat, lng, ...jobWithoutWgs84 } = job;

      if (lat == null || lng == null) {
        return jobWithoutWgs84;
      }

      const lambert = this.coordinatesService.convertLambert(
        Number(lat),
        Number(lng),
      );

      return {
        ...jobWithoutWgs84,
        lambert93: {
          epsg: 'EPSG:2154',
          x: lambert.x,
          y: lambert.y,
        },
      };
    }

    async export(userId: number, userRole: UserRole): Promise<StreamableFile> {
        let exportData: Record<string, any>;

        switch (userRole) {
            case UserRole.SEEKER:
                const seeker = await this.seekerService.findOne(userId);

                if (!seeker) {
                    throw new NotFoundException;
                }

                const applications = await this.applicationService.findbySeekerId(userId);

                const applicationsconvert = applications.map((application) => ({...application,
                  job: application.job ? this.addLambertToJob(application.job) : application.job,}));

                exportData = {
                    profile: seeker,
                    applications: applicationsconvert ?? [],
                }
                break;
            case UserRole.EMPLOYER:
                const employer = await this.employerService.findOne(userId);

                if (!employer) {
                    throw new NotFoundException;
                }

                const jobs = await this.jobService.findByEmployer(userId);
                const jobsconvert = jobs.map((job) => this.addLambertToJob(job));
                const notifications = await this.notificationService.findMe(userId);

                exportData = {
                    profile: employer,
                    jobs: jobsconvert ?? [],
                    notifications: notifications ?? []
                }

                break;
            case UserRole.ADMIN:
                const user = await this.userService.findOne(userId);

                if (!user) {
                    throw new NotFoundException;
                }
                exportData = { profile: user }
                break;
        }

        return new StreamableFile(Buffer.from(JSON.stringify(exportData)),
            {
                type: 'application/json',
                disposition: `attachment; filename="export-${userId}.json"`,
            }
        );
    }

}
