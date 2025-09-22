Plans for mobile sdk

in app
move ConirmBelongingScreen from prove folder to documents folder as it is not about disclosures like the rest of the proving screens but about confirming that you want to register your document on chain


msdk/src folders
  /exports
    onboard/
      start.ts
      collect-data/
        aadhaar.ts
          (qr code, success, and failures)
        mrz.ts
        nfc.ts
      register-proof.ts
        (from the current ConfirmBelonging screen and loading screen)


    disclose
      confirmation.ts
