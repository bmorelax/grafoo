import { h } from "preact";

export function Mutation({ children, query }, { client }) {
  const mutate = ({ variables, optimisticUpdate }) => {
    if (optimisticUpdate) {
      try {
        client.write({ query, variables }, optimisticUpdate);
      } catch (err) {
        const source = query.query.replace(/[\s,]+/g, " ").trim();

        // eslint-disable-next-line no-console
        console.error(
          "Failed to apply optimistic update on mutation `" +
            source +
            "`. Have you forgot to pass an ID field?"
        );
      }
    }

    return client.request({ query, variables }).then(data => {
      const request = { query, variables };

      return {
        data,
        cache: {
          read: () => client.read(request),
          write: data => client.write(request, data)
        }
      };
    });
  };

  return children[0]({ mutate });
}

export function withMutation(query) {
  return Child => {
    const Wrapper = ownProps =>
      h(Mutation, { query }, props => h(Child, Object.assign({}, ownProps, props)));

    if (process.env.NODE_ENV !== "production") Wrapper.displayName = `Mutation(${Child.name})`;

    return Wrapper;
  };
}
