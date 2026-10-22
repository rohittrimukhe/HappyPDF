import Capacitor

final class HappyPdfBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        bridge?.registerPluginInstance(HappyPdfDocumentsPlugin())
        bridge?.registerPluginInstance(HappyPdfPurchasesPlugin())
    }
}
