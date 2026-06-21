import { type ReactNode, type FC } from 'react';

interface IProviderComposerProps {
  providers: Array<FC<{ children: ReactNode }>>;
  children: ReactNode;
}

const ProviderComposer: FC<IProviderComposerProps> = ({
  providers,
  children,
}) => {
  return providers.reduceRight(
    (kids, Provider) => <Provider>{kids}</Provider>,
    <>{children}</>
  );
};

export default ProviderComposer;
