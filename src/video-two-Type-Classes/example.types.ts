//#region HKT
/**
 * The HKT (Higher Kinded Type) type is the fp-ts way to represent
 * a generic type constructor.
 *
 * so when you see HKT<F, X>
 *  - you can think to the type constructor F applied to the type X (i.e. F<X>)
 */
interface HKT<URI, A> {
  readonly _URI: URI
  readonly _A: A
}
//#endregion

//#region Functor
//#region Functor Laws
/**
 * associated laws:
 * Identity: F.map(fa, a => a) <-> fa
 * - note: (<->) just means these things are equivalent
 * Composition: F.map(fa, a => bc(ab(a))) <-> F.map(F.map(fa, ab), bc)
 */
//#endregion
interface Functor<F> {
  readonly URI: F
  readonly map: <A, B>(fa: HKT<F, A>, f: (a: A) => B) => HKT<F, B>
  // basic example -> map: (Foo<A>, A => B) => Foo<B>
}
//#endregion

//#region Apply
//#region Apply Laws
/**
 * associated laws (in addition to the Functor laws):
 * Associative composition: F.ap(F.ap(F.map(fbc, bc => ab => a => bc(ab(a))), fab), fa) <-> F.ap(fbc, F.ap(fab, fa))
 * note: `fbc` in F.ap(fbc, F.ap(fab, fa)) 👉 can be read as "Eff of Bee to Cee" or F<B => C>
 */
//#endregion
interface Apply<F> extends Functor<F> {
  readonly ap: <A, B>(fab: HKT<F, (a: A) => B>, fa: HKT<F, A>) => HKT<F, B>
  // basic example -> ap: (Foo<A => B>, Foo<A>) => Foo<B>
  // another basic example -> ap: (Foo<A>, Foo<B>) => Foo<[A, B]>
}
//#endregion

//#region Chain
//#region Chain Laws
/**
 * associated laws:
 * Associativity: F.chain(F.chain(fa, afb), bfc) <-> F.chain(fa, a => F.chain(afb(a), bfc))
 */
//#endregion
interface Chain<F> extends Apply<F> {
  readonly chain: <A, B>(fa: HKT<F, A>, f: (a: A) => HKT<F, B>) => HKT<F, B>
  // basic example -> chain: (Foo<A>, (A => Foo<B>)) => Foo<B>
}
//#endregion

//#region Applicative
//#region Applicative Laws
/**
 * Identity: A.ap(A.of(a => a), fa) <-> fa
 * Homomorphism: A.ap(A.of(ab), A.of(a)) <-> A.of(ab(a))
 * Interchange: A.ap(fab, A.of(a)) <-> A.ap(A.of(ab => ab(a)), fab)
 */
//#endregion
interface Applicative<F> extends Apply<F> {
  readonly of: <A>(a: A) => HKT<F, A>
  // basic example -> of: A => Foo<A>
}
//#endregion
