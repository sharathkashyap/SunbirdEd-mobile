import {SplashscreenActionHandlerDelegate} from "@app/service/sunbird-splashscreen/splashscreen-action-handler-delegate";
import {Observable} from "rxjs";
import {
  ContentEventType,
  ContentImportProgress,
  ContentService,
  EventNamespace,
  EventsBusService,
  ProfileService,
  TelemetryService,
  ContentImportResponse,
  ContentImportStatus
} from "sunbird-sdk";
import {Inject, Injectable} from "@angular/core";
import {CommonUtilService} from "@app/service";

@Injectable()
export class SplashscreenImportActionHandlerDelegate implements SplashscreenActionHandlerDelegate {
  constructor(@Inject('CONTENT_SERVICE') private contentService: ContentService,
              @Inject('EVENTS_BUS_SERVICE') private eventsBusService: EventsBusService,
              @Inject('PROFILE_SERVICE') private profileService: ProfileService,
              @Inject('TELEMETRY_SERVICE') private telemetryService: TelemetryService,
              private commonUtilService: CommonUtilService,) {
  }

  onAction(type: string, payload: { filePath: string }): Observable<undefined> {
    const filePath = 'file://' + payload.filePath;
    const fileExtenstion = filePath.split('.').pop();

    switch (fileExtenstion) {
      case 'ecar': {
        return Observable.of(undefined)
          .do(async () => {
            await this.invokeImportEcar(filePath);
          }).mergeMap(() => {
            return this.eventsBusService.events(EventNamespace.CONTENT)
              .filter(e => e.type === ContentEventType.IMPORT_PROGRESS)
              .takeUntil(
                this.eventsBusService.events(EventNamespace.CONTENT)
                  .filter(e => e.type === ContentEventType.IMPORT_COMPLETED)
              )
          }).do((event: ContentImportProgress) => {
            splashscreen.setImportProgress(event.payload.currentCount, event.payload.totalCount);
          }).mapTo(undefined) as any;
      }
      case 'epar': {
        return this.profileService.importProfile({
          sourceFilePath: filePath
        }).do(() => {
          this.commonUtilService.showToast('import_profile: completed');
        }).mapTo(undefined) as any;
      }
      case 'gsa': {
        return this.telemetryService.importTelemetry({
          sourceFilePath: filePath
        }).do(() => {
          this.commonUtilService.showToast('import_telemetry: completed');
        }).mapTo(undefined) as any;
      }
      default:
        return Observable.of(undefined);
    }
  }

  async invokeImportEcar(filePath: string): Promise<void> {
    return this.contentService.importEcar({
      isChildContent: false,
      destinationFolder: cordova.file.externalDataDirectory,
      sourceFilePath: filePath,
      correlationData: []
    }).toPromise().then((response: ContentImportResponse[]) => {
      if (!response.length) {
        this.commonUtilService.showToast('import_content: completed');
        return;
      }

      response.forEach((response: ContentImportResponse) => {
        switch (response.status) {
          case ContentImportStatus.ALREADY_EXIST:
            this.commonUtilService.showToast('import_content: already exists');
            break;
        }
      });
    }).catch(() => {
      this.commonUtilService.showToast('import_content: failed');
    })
  }
}