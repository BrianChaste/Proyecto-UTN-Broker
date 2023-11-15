import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Coin, CoinApi, User, Wallet } from 'src/app/core/Models';
import { WalletService } from 'src/app/modules/main/services/wallet.service';

@Component({
  selector: 'app-sell-coins',
  templateUrl: './sell-coins.component.html',
  styleUrls: ['./sell-coins.component.css']
})
export class SellCoinsComponent implements OnInit, OnChanges {

  @Input() coinToSell!: CoinApi;
  currentWallet!: Wallet;
  currentUser!: User;

  showForm = true;
  cantidadVenta: number = 0;
  cantidadParaVender: number = 0;
  USD: number = 0;
  gananciaVenta: number = 0;

  compraOnOf: boolean = false;

  constructor(private wallet: WalletService, private router: Router) {}

  ngOnInit(): void {
    this.currentUser = new User(JSON.parse(sessionStorage.getItem('userLoged')!));
    this.getWallets();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['coinToSell'] && this.currentWallet) {
      this.cantidadParaVenta();
    }
  }

  getWallets(): void {
    this.wallet.getAllWalletFromService().then((allWallets: Wallet[]) => {
      this.currentWallet = allWallets.find((w) => w.idUser == this.currentUser.id)!;
      this.cantidadParaVenta();
    }).catch(error => {
      console.error('Error al intentar obtener las wallets', error);
    });
  }

  updateWallet(wallet: Wallet): void {
    this.wallet.updateWalletFromService(wallet).catch(error => {
      console.error('Error al intentar actualizar la wallet', error);
    });
  }

  cantidadParaVenta(): void {
    if (this.coinToSell) {
      const idToSell = this.coinToSell.id.toUpperCase();
      const coin = this.currentWallet.coins.find(c => c.id!.toUpperCase() == idToSell.toUpperCase());

      console.log(coin);

      if (coin) {
        this.cantidadVenta = coin.coinAmount;
      } else {
        this.cantidadVenta = 0;
      }
    }
  }

  calcularVenta(): void {
    if (this.cantidadParaVender <= this.cantidadVenta) {
      this.gananciaVenta = this.cantidadParaVender * this.coinToSell.current_price;
      this.cantidadVenta = Math.trunc(this.cantidadVenta * 1000) / 1000;
      this.compraOnOf = true;
    } else {
      alert(`No cuenta con los fondos de ${this.coinToSell.id} necesarios para esta transacción`);
    }
  }

  ventaCripto(): void {
    const idToSell = this.coinToSell.id.toUpperCase();
    const coinIndex = this.currentWallet.coins.findIndex(c => c.id === idToSell);

    if (coinIndex !== -1) {
      const coin = this.currentWallet.coins[coinIndex];
      coin.coinAmount -= this.cantidadParaVender;

      if (coin.coinAmount <= 0) {
        this.currentWallet.coins.splice(coinIndex, 1);
      }
    }
  }


  confirmarVenta(): void {
    this.calcularVenta();

    if (this.compraOnOf) {
      this.currentWallet.fondos += this.gananciaVenta;
      this.ventaCripto();
      this.updateWallet(this.currentWallet);
      this.toggleForm();
      this.router.navigate(['main/myWallet']);
    } else {
      alert('No se pudo realizar la venta');
    }
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

}
