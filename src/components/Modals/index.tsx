import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { modalsSettings, ModalState, useModal } from 'hooks/useModal'
import { Fragment, Suspense } from 'preact/compat'

export default function Modal() {
  const { closeModal, modalState, modalProps } = useModal()
  const ModalComponent = modalsSettings[modalState].component

  return (
    <Transition appear show={modalState !== ModalState.Closed} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[rgba(95,27,116,0)] bg-gradient-to-t from-[#2a3fff66] to-transparent backdrop-blur-[4px]" />
        </TransitionChild>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="transform space-y-8 overflow-y-auto md:max-h-[90vh] md:w-[80%] md:p-8">
                <Suspense fallback={null}>
                  <ModalComponent {...modalProps} />
                </Suspense>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
