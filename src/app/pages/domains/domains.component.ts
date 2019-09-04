import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout"
import { HttpErrorResponse } from "@angular/common/http"
import { Component, OnInit, ViewChild } from "@angular/core"
import { MatDialog, MatDialogRef, MatSnackBar, MatSort, MatTableDataSource } from "@angular/material"
import { Domain, DomainsService } from "ducky-api-client-angular"
import { Observable, Subscription } from "rxjs"
import { map } from "rxjs/operators"
import { ConfirmDialogComponent } from "src/app/components/confirm-dialog/confirm-dialog.component"
import { ConfirmDialogConfig } from "src/app/components/confirm-dialog/confirm-dialog.interfaces"

import { AddDomainDialogComponent } from "./components/add-domain-dialog/add-domain-dialog.component"

interface DomainData {
  domain: string
}

@Component({
  selector: "app-domains",
  templateUrl: "./domains.component.html",
  styleUrls: ["./domains.component.scss"]
})
export class DomainsComponent implements OnInit {
  public displayedColumns = ["domain", "actions"]
  public dataSource: MatTableDataSource<DomainData>
  public domainSubscription: Subscription
  public isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map((result): boolean => result.matches))

  @ViewChild(MatSort, { static: false })
  private set content(sort: MatSort) {
    // Needed because of the ngif wrapper around the table
    if (this.dataSource) {
      this.dataSource.sort = sort
    }
  }

  public constructor(
    private breakpointObserver: BreakpointObserver,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private readonly domainsService: DomainsService
  ) {}

  public ngOnInit(): void {
    this.getDomains()
  }

  public getDomains(): void {
    this.domainSubscription = this.domainsService.domainsGet().subscribe(
      (domains: Domain[]): void => {
        this.dataSource = new MatTableDataSource(domains)
      },
      (error: HttpErrorResponse): void => {
        alert(error.message)
      }
    )
  }

  public addDialog(): void {
    const dialog = this.dialog.open(AddDomainDialogComponent)
    dialog.afterClosed().subscribe((result): void => {
      if (result) {
        this.getDomains()
      }
    })
  }

  public removeConfirmDialog(domain: string): void {
    const dialogConfig: ConfirmDialogConfig = {
      data: {
        title: `Remove ${domain}`,
        text: "Are you sure? This will also remove accounts associated with this domain.",
        buttons: [
          {
            options: {
              active: false,
              text: "NO",
              buttonColor: "primary"
            }
          },
          {
            options: {
              active: false,
              text: "YES",
              buttonColor: "warn",
              spinnerSize: 18,
              mode: "indeterminate"
            },
            callback: (dialogRef: MatDialogRef<ConfirmDialogComponent>): void => {
              dialogRef.disableClose = true
              dialogConfig.data.buttons[0].options.disabled = true
              dialogConfig.data.buttons[1].options.active = true
              this.domainsService.domainsDomainDelete(domain).subscribe((): void => {
                dialogRef.close()
                this.snackBar.open(`${domain} has been removed`, undefined, { duration: 3000 })
                this.getDomains()
              })
            }
          }
        ]
      }
    }
    this.dialog.open(ConfirmDialogComponent, dialogConfig)
  }
}
