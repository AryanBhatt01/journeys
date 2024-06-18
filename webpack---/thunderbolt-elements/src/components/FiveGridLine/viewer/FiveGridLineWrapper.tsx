import * as React from 'react';
import classNames from 'clsx';
import {
  formatClassNames,
  getDataAttributes,
  getTabIndexAttribute,
} from '@wix/editor-elements-common-utils';
import { FiveGridLineProps } from '../FiveGridLine.types';
import semanticClassNames from '../FiveGridLine.semanticClassNames';

type FiveGridLineWrapperProps = Omit<FiveGridLineProps, 'skin'> & {
  className?: string;
};

export const FiveGridLineWrapper: React.FC<
  FiveGridLineWrapperProps
> = props => {
  const {
    id,
    children,
    className,
    customClassNames = [],
    onMouseEnter,
    onMouseLeave,
  } = props;

  return (
    <div
      id={id}
      className={classNames(
        className,
        formatClassNames(semanticClassNames.root, ...customClassNames),
      )}
      {...getDataAttributes(props)}
      {...getTabIndexAttribute(props.a11y)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
};
