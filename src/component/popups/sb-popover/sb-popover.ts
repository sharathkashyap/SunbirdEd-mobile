import { Component } from '@angular/core';
import { ContentActionsComponent } from '@app/component';
import { ViewController } from 'ionic-angular/navigation/view-controller';
import {
  NavParams,
  ToastController,
  Platform
} from 'ionic-angular';
import { TelemetryGeneratorService } from '../../../service/telemetry-generator.service';
import { TelemetryObject , ContentService, AuthService, Environment, Rollup, CorrelationData, InteractType, InteractSubtype} from 'sunbird';
import { TranslateService } from '@ngx-translate/core';
import { Events } from 'ionic-angular/index';
import { ProfileConstants } from '../../../app/app.constant';

/**
 * Generated class for the PopupsComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'sb-popover',
  templateUrl: 'sb-popover.html'
})
export class SbPopoverComponent {

  sbPopoverHeading: any;
  sbPopoverMainTitle: any;
  sbPopoverContent: any;
  actionsButtons: any;
  icon: any;
  metaInfo: any;
  content: any;
  data: any;
  isChild = false;
  contentId: string;
  batchDetails: any;
  backButtonFunc = undefined;
  userId = '';
  pageName = '';
  showFlagMenu = true;
  public objRollup: Rollup;
  private corRelationList: Array<CorrelationData>;


  constructor(public viewCtrl: ViewController, public navParams: NavParams,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private contentService: ContentService,
    private toastCtrl: ToastController,
    private translate: TranslateService,
    private events: Events,
    private authService: AuthService,
    private platform: Platform) {
    this.content = this.navParams.get('content');
    this.actionsButtons = this.navParams.get('actionsButtons');
    this.icon = this.navParams.get('icon');
    this.metaInfo = this.navParams.get('metaInfo');
    this.sbPopoverContent = this.navParams.get('sbPopoverContent');
    this.sbPopoverHeading = this.navParams.get('sbPopoverHeading');
    this.sbPopoverMainTitle = this.navParams.get('sbPopoverMainTitle');
    console.log('this.actionsButtons', this.actionsButtons);
    console.log('this.sbPopoverMainTitle', this.sbPopoverMainTitle);

    this.content = this.navParams.get('content');
    this.data = this.navParams.get('data');
    this.batchDetails = this.navParams.get('batchDetails');
    this.pageName = this.navParams.get('pageName');
    this.objRollup = this.navParams.get('objRollup');
    this.corRelationList = this.navParams.get('corRelationList');

    if (this.navParams.get('isChild')) {
      this.isChild = true;
    }

    this.contentId = (this.content && this.content.identifier) ? this.content.identifier : '';
    this.backButtonFunc = this.platform.registerBackButtonAction(() => {
      this.viewCtrl.dismiss();
      this.backButtonFunc();
    }, 20);
  }

  closePopover() {
    this.viewCtrl.dismiss();
  }
  deleteContent(candelete: boolean = false) {
    this.viewCtrl.dismiss(candelete);
  }
   /**
   * Construct content delete request body
   */
  getDeleteRequestBody() {
    const apiParams = {
      contentDeleteList: [{
        contentId: this.contentId,
        isChildContent: this.isChild
      }]
    };
    return apiParams;
  }
}