export abstract class AbstractTargetAccount {
  abstract start()
  abstract getAccounts()
  // abstract getSymbolMappings()
  // abstract setSymbolMapping(sourceSymbol:string, targetSymbol:string)
  // abstract addSymbol(newSymbol:string)
  abstract placeOrder(targetSymbol:string, amount:number)
  abstract stop()
}
