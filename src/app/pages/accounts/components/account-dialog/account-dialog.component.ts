import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout"
import { Component, Inject, OnInit } from "@angular/core"
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material"
import { AccountDetails, DomainsService, EmailAccountsService } from "ducky-api-client-angular"
import { Observable, Subscription } from "rxjs"
import { map } from "rxjs/operators"

@Component({
  selector: "app-account-dialog",
  templateUrl: "./account-dialog.component.html",
  styleUrls: ["./account-dialog.component.scss"]
})
export class AccountDialogComponent implements OnInit {
  public isModifyDialog: boolean
  public isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map((result): boolean => result.matches))
  public addressName: string
  public domains: string[]
  public domainsSubscription: Subscription
  public accountDetails: AccountDetails
  public accountDetailsSubscription: Subscription
  public constructor(
    public dialogRef: MatDialogRef<AccountDialogComponent>,
    private breakpointObserver: BreakpointObserver,
    private readonly domainsService: DomainsService,
    private readonly emailAccountsService: EmailAccountsService,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}

  public ngOnInit(): void {
    // If id was passed this is a modify dialog, otherwise it is a create dialog
    if (this.data) {
      this.getAccount()
    } else {
      this.getDomains()
    }
  }

  public getAccount(): void {
    this.isModifyDialog = true

    this.accountDetailsSubscription = this.emailAccountsService
      .accountsAccountIdGet(this.data.id)
      .subscribe((account): void => {
        this.accountDetails = account
        // Split address to name and domain for split input
        this.addressName = this.accountDetails.address.substring(0, this.accountDetails.address.lastIndexOf("@"))
        this.domains = [this.accountDetails.address.substring(this.accountDetails.address.lastIndexOf("@") + 1)]
      })
  }

  public getDomains(): void {
    this.domainsSubscription = this.domainsService.domainsGet().subscribe((domains): void => {
      this.domains = domains.map((value): string => value.domain)
    })
  }

  public updateAccount(): void {
    alert("function to execute when saved")
    this.dialogRef.close()
  }
}
